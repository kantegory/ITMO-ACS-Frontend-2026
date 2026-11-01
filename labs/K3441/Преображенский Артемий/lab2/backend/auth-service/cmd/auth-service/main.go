package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"restaurant-booking/internal/serviceruntime"

	"github.com/prometheus/client_golang/prometheus"
	"restaurant-booking/auth-service/config"
	"restaurant-booking/auth-service/docs"
	"restaurant-booking/auth-service/internal/adapter/postgres"
	"restaurant-booking/auth-service/internal/adapter/rabbitmq"
	httpcontroller "restaurant-booking/auth-service/internal/controller/http"
	internalgetuser "restaurant-booking/auth-service/internal/features/internal-get-user"
	"restaurant-booking/auth-service/internal/features/login"
	"restaurant-booking/auth-service/internal/features/me"
	"restaurant-booking/auth-service/internal/features/outbox"
	"restaurant-booking/auth-service/internal/features/register"
	"restaurant-booking/auth-service/pkg/jwt"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Print(err)
		os.Exit(1)
	}
	if err := AppRun(ctx, cfg); err != nil {
		log.Print("service stopped: ", err)
		os.Exit(1)
	}
}

func AppRun(ctx context.Context, cfg config.Config) error {
	if err := cfg.Validate(); err != nil {
		return err
	}
	startupCtx, startupCancel := context.WithTimeout(ctx, 5*time.Second)
	defer startupCancel()
	pgPool, err := postgres.New(startupCtx, cfg.Postgres)
	if err != nil {
		return fmt.Errorf("database connection failed")
	}
	defer pgPool.Close()
	err = serviceruntime.Schema(startupCtx, pgPool.Pgx(), 2)
	startupCancel()
	if err != nil {
		return err
	}

	publisher, err := rabbitmq.NewPublisher(cfg.RabbitMQURL)
	if err != nil {
		return err
	}
	defer publisher.Close()
	jwtDur, _ := time.ParseDuration(cfg.JWTExpires)
	jwtCfg := jwt.Config{Secret: []byte(cfg.JWTSecret), Expires: jwtDur}
	registerUsecase := register.NewUsecase(register.NewPostgres(pgPool), jwtCfg)

	loginUsecase := login.NewUsecase(login.NewPostgres(pgPool), jwtCfg)
	meUsecase := me.NewUsecase(me.NewPostgres(pgPool))
	userGetUsecase := internalgetuser.NewUsecase(internalgetuser.NewPostgres(pgPool))

	routes := httpcontroller.Routes{
		JWT: jwtCfg,
		Public: httpcontroller.PublicRoutes{
			Register: register.HTTP(registerUsecase),
			Login:    login.HTTP(loginUsecase),
			Profile:  me.HTTP(meUsecase),
		},
		Internal: httpcontroller.InternalRoutes{
			UserGet: internalgetuser.HTTP(userGetUsecase),
		},
	}

	apiRouter := httpcontroller.Router(routes)

	runtime := serviceruntime.New("auth", apiRouter, docs.OpenAPISpec, func(ctx context.Context) error { return serviceruntime.Schema(ctx, pgPool.Pgx(), 2) })
	published := prometheus.NewCounter(prometheus.CounterOpts{Name: "outbox_published_total", Help: "Confirmed outbox events."})
	failed := prometheus.NewCounter(prometheus.CounterOpts{Name: "outbox_publish_failures_total", Help: "Failed outbox publication attempts."})
	failures := prometheus.NewCounter(prometheus.CounterOpts{Name: "outbox_worker_errors_total", Help: "Outbox worker operation failures."})
	repo := outbox.NewPostgres(pgPool)
	worker := outbox.NewWorker(repo, publisher, outbox.Options{OnPublished: published.Inc, OnPublishFailed: failed.Inc, OnError: func(error) { failures.Inc() }})
	workerCtx, stopWorkers := context.WithCancel(context.WithoutCancel(ctx))
	done := make(chan struct{})
	go func() { defer close(done); _ = worker.Run(workerCtx) }()
	defer func() { stopWorkers(); <-done }()
	runtime.Registry.MustRegister(published, failed, failures,
		prometheus.NewGaugeFunc(prometheus.GaugeOpts{Name: "outbox_publisher_connected", Help: "Publisher connection availability."}, func() float64 {
			if worker.Ready() {
				return 1
			}
			return 0
		}),
		prometheus.NewGaugeFunc(prometheus.GaugeOpts{Name: "outbox_pending_events", Help: "Unpublished durable events; -1 when unavailable."}, func() float64 {
			ctx, cancel := context.WithTimeout(workerCtx, time.Second)
			defer cancel()
			m, err := repo.Metrics(ctx)
			if err != nil {
				return -1
			}
			return float64(m.Pending)
		}),
		prometheus.NewGaugeFunc(prometheus.GaugeOpts{Name: "outbox_oldest_pending_age_seconds", Help: "Age of the oldest pending event; -1 when unavailable."}, func() float64 {
			ctx, cancel := context.WithTimeout(workerCtx, time.Second)
			defer cancel()
			m, err := repo.Metrics(ctx)
			if err != nil {
				return -1
			}
			if m.OldestPendingAt == nil {
				return 0
			}
			return time.Since(*m.OldestPendingAt).Seconds()
		}),
	)
	return runtime.Serve(ctx, cfg.HTTPAddr)
}
