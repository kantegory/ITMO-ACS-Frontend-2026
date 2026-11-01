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

	"restaurant-booking/booking-service/config"
	"restaurant-booking/booking-service/docs"
	catalogclient "restaurant-booking/booking-service/internal/adapter/catalog-client"
	"restaurant-booking/booking-service/internal/adapter/postgres"
	httpcontroller "restaurant-booking/booking-service/internal/controller/http"
	"restaurant-booking/booking-service/internal/features/booking/availability"
	bookingcancel "restaurant-booking/booking-service/internal/features/booking/cancel"
	bookingcreate "restaurant-booking/booking-service/internal/features/booking/create"
	bookingget "restaurant-booking/booking-service/internal/features/booking/get"
	bookinglist "restaurant-booking/booking-service/internal/features/booking/list"
	"restaurant-booking/booking-service/pkg/jwt"
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
	err = serviceruntime.Schema(startupCtx, pgPool.Pgx(), 1)
	startupCancel()
	if err != nil {
		return err
	}

	jwtCfg := jwt.Config{Secret: []byte(cfg.JWTSecret)}

	catalogClient := catalogclient.New(cfg.CatalogServiceURL)

	availabilityUsecase := availability.NewUsecase(availability.NewPostgres(pgPool), catalogClient)
	createUsecase := bookingcreate.NewUsecase(bookingcreate.NewPostgres(pgPool), catalogClient)
	listUsecase := bookinglist.NewUsecase(bookinglist.NewPostgres(pgPool))
	getUsecase := bookingget.NewUsecase(bookingget.NewPostgres(pgPool))
	cancelUsecase := bookingcancel.NewUsecase(bookingcancel.NewPostgres(pgPool))

	routes := httpcontroller.Routes{
		JWT: jwtCfg,
		Public: httpcontroller.PublicRoutes{
			Availability:  availability.HTTP(availabilityUsecase),
			BookingCreate: bookingcreate.HTTP(createUsecase),
			BookingList:   bookinglist.HTTP(listUsecase),
			BookingGet:    bookingget.HTTP(getUsecase),
			BookingCancel: bookingcancel.HTTP(cancelUsecase),
		},
	}

	apiRouter := httpcontroller.Router(routes)

	runtime := serviceruntime.New("booking", apiRouter, docs.OpenAPISpec, func(ctx context.Context) error { return serviceruntime.Schema(ctx, pgPool.Pgx(), 1) })
	return runtime.Serve(ctx, cfg.HTTPAddr)
}
