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

	"errors"
	"github.com/prometheus/client_golang/prometheus"
	"restaurant-booking/catalog-service/config"
	"restaurant-booking/catalog-service/docs"
	"restaurant-booking/catalog-service/internal/adapter/postgres"
	httpcontroller "restaurant-booking/catalog-service/internal/controller/http"
	menucreate "restaurant-booking/catalog-service/internal/features/menu/create"
	menudelete "restaurant-booking/catalog-service/internal/features/menu/delete"
	menuget "restaurant-booking/catalog-service/internal/features/menu/get"
	menulist "restaurant-booking/catalog-service/internal/features/menu/list"
	restaurantcreate "restaurant-booking/catalog-service/internal/features/restaurant/create"
	restaurantdelete "restaurant-booking/catalog-service/internal/features/restaurant/delete"
	restaurantget "restaurant-booking/catalog-service/internal/features/restaurant/get"
	internalgettable "restaurant-booking/catalog-service/internal/features/restaurant/internal-get-table"
	restaurantlist "restaurant-booking/catalog-service/internal/features/restaurant/list"
	reviewcreate "restaurant-booking/catalog-service/internal/features/review/create"
	reviewdelete "restaurant-booking/catalog-service/internal/features/review/delete"
	reviewget "restaurant-booking/catalog-service/internal/features/review/get"
	reviewlist "restaurant-booking/catalog-service/internal/features/review/list"
	reviewupdate "restaurant-booking/catalog-service/internal/features/review/update"
	tablecreate "restaurant-booking/catalog-service/internal/features/table/create"
	tabledelete "restaurant-booking/catalog-service/internal/features/table/delete"
	tableget "restaurant-booking/catalog-service/internal/features/table/get"
	tablelist "restaurant-booking/catalog-service/internal/features/table/list"
	"restaurant-booking/catalog-service/pkg/jwt"
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

	jwtCfg := jwt.Config{Secret: []byte(cfg.JWTSecret)}

	reviewCreateRepo := reviewcreate.NewPostgres(pgPool)

	// Consumers stay alive while HTTP requests drain, then stop before the pool.
	workerCtx, stopWorkers := context.WithCancel(context.WithoutCancel(ctx))
	defer stopWorkers()
	consumer, err := reviewcreate.StartUserConsumer(workerCtx, cfg.RabbitMQURL, reviewCreateRepo)
	if err != nil {
		return err
	}
	defer consumer.Close()

	restaurantListUsecase := restaurantlist.NewUsecase(restaurantlist.NewPostgres(pgPool))
	restaurantGetUsecase := restaurantget.NewUsecase(restaurantget.NewPostgres(pgPool))
	restaurantCreateUsecase := restaurantcreate.NewUsecase(restaurantcreate.NewPostgres(pgPool))
	restaurantDeleteUsecase := restaurantdelete.NewUsecase(restaurantdelete.NewPostgres(pgPool))
	menuListUsecase := menulist.NewUsecase(menulist.NewPostgres(pgPool))
	menuCreateUsecase := menucreate.NewUsecase(menucreate.NewPostgres(pgPool))
	menuGetUsecase := menuget.NewUsecase(menuget.NewPostgres(pgPool))
	menuDeleteUsecase := menudelete.NewUsecase(menudelete.NewPostgres(pgPool))
	tableListUsecase := tablelist.NewUsecase(tablelist.NewPostgres(pgPool))
	tableCreateUsecase := tablecreate.NewUsecase(tablecreate.NewPostgres(pgPool))
	tableGetUsecase := tableget.NewUsecase(tableget.NewPostgres(pgPool))
	tableInternalGetUsecase := internalgettable.NewUsecase(internalgettable.NewPostgres(pgPool))
	tableDeleteUsecase := tabledelete.NewUsecase(tabledelete.NewPostgres(pgPool))
	reviewListUsecase := reviewlist.NewUsecase(reviewlist.NewPostgres(pgPool))
	reviewCreateUsecase := reviewcreate.NewUsecase(reviewCreateRepo)
	reviewGetUsecase := reviewget.NewUsecase(reviewget.NewPostgres(pgPool))
	reviewUpdateUsecase := reviewupdate.NewUsecase(reviewupdate.NewPostgres(pgPool))
	reviewDeleteUsecase := reviewdelete.NewUsecase(reviewdelete.NewPostgres(pgPool))

	routes := httpcontroller.Routes{
		JWT: jwtCfg,
		Public: httpcontroller.PublicRoutes{
			RestaurantList:   restaurantlist.HTTP(restaurantListUsecase),
			RestaurantGet:    restaurantget.HTTP(restaurantGetUsecase),
			RestaurantCreate: restaurantcreate.HTTP(restaurantCreateUsecase),
			RestaurantDelete: restaurantdelete.HTTP(restaurantDeleteUsecase),
			MenuList:         menulist.HTTP(menuListUsecase),
			MenuCreate:       menucreate.HTTP(menuCreateUsecase),
			MenuGet:          menuget.HTTP(menuGetUsecase),
			MenuDelete:       menudelete.HTTP(menuDeleteUsecase),
			TableList:        tablelist.HTTP(tableListUsecase),
			TableCreate:      tablecreate.HTTP(tableCreateUsecase),
			TableGet:         tableget.HTTP(tableGetUsecase),
			TableDelete:      tabledelete.HTTP(tableDeleteUsecase),
			ReviewList:       reviewlist.HTTP(reviewListUsecase),
			ReviewCreate:     reviewcreate.HTTP(reviewCreateUsecase),
			ReviewGet:        reviewget.HTTP(reviewGetUsecase),
			ReviewUpdate:     reviewupdate.HTTP(reviewUpdateUsecase),
			ReviewDelete:     reviewdelete.HTTP(reviewDeleteUsecase),
		},
		Internal: httpcontroller.InternalRoutes{
			TableGet: internalgettable.HTTP(tableInternalGetUsecase),
		},
	}

	apiRouter := httpcontroller.Router(routes)

	runtime := serviceruntime.New("catalog", apiRouter, docs.OpenAPISpec, func(ctx context.Context) error {
		if err := serviceruntime.Schema(ctx, pgPool.Pgx(), 2); err != nil {
			return err
		}
		if !consumer.Ready() {
			return errors.New("consumer unavailable")
		}
		return nil
	})
	runtime.Registry.MustRegister(
		prometheus.NewGaugeFunc(prometheus.GaugeOpts{Name: "catalog_consumer_connected", Help: "Consumer subscription availability."}, func() float64 {
			if consumer.Ready() {
				return 1
			}
			return 0
		}),
		prometheus.NewCounterFunc(prometheus.CounterOpts{Name: "catalog_consumer_processed_total", Help: "Messages saved and acknowledged."}, func() float64 { return float64(consumer.Snapshot().Processed) }),
		prometheus.NewCounterFunc(prometheus.CounterOpts{Name: "catalog_consumer_retries_total", Help: "Transient processing retries."}, func() float64 { return float64(consumer.Snapshot().Retried) }),
		prometheus.NewCounterFunc(prometheus.CounterOpts{Name: "catalog_consumer_invalid_total", Help: "Messages copied into quarantine."}, func() float64 { return float64(consumer.Snapshot().Invalid) }),
		prometheus.NewCounterFunc(prometheus.CounterOpts{Name: "catalog_consumer_reconnects_total", Help: "Subscription reconnect attempts."}, func() float64 { return float64(consumer.Snapshot().Reconnects) }),
	)
	return runtime.Serve(ctx, cfg.HTTPAddr)
}
