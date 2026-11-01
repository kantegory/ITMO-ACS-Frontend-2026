package serviceruntime

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	httpSwagger "github.com/swaggo/http-swagger"

	"restaurant-booking/internal/buildinfo"
	"restaurant-booking/internal/httpjson"
)

type Runtime struct {
	Handler  http.Handler
	Registry *prometheus.Registry
}

func New(service string, api http.Handler, spec []byte, ready func(context.Context) error) *Runtime {
	registry := prometheus.NewRegistry()
	requests := prometheus.NewCounterVec(prometheus.CounterOpts{Name: "http_requests_total", Help: "HTTP responses by route template.", ConstLabels: prometheus.Labels{"service": service}}, []string{"method", "route", "status"})
	latency := prometheus.NewHistogramVec(prometheus.HistogramOpts{Name: "http_request_duration_seconds", Help: "HTTP request duration.", ConstLabels: prometheus.Labels{"service": service}, Buckets: prometheus.DefBuckets}, []string{"method", "route"})
	registry.MustRegister(requests, latency, collectors.NewGoCollector(), collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}))
	r := chi.NewRouter()
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			w.Header().Set("X-App-Revision", buildinfo.Revision)
			started := time.Now()
			recorder := middleware.NewWrapResponseWriter(w, req.ProtoMajor)
			next.ServeHTTP(recorder, req)
			route := chi.RouteContext(req.Context()).RoutePattern()
			// A mount can expose a broad wildcard; obtain the nested route when present.
			if route == "" {
				route = "unmatched"
			}
			status := recorder.Status()
			if status == 0 {
				status = http.StatusOK
			}
			method := req.Method
			switch method {
			case "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS":
			default:
				method = "OTHER"
			}
			requests.WithLabelValues(method, route, strconv.Itoa(status)).Inc()
			latency.WithLabelValues(method, route).Observe(time.Since(started).Seconds())
		})
	})
	r.Use(httpjson.Recoverer)
	r.Get("/live", func(w http.ResponseWriter, r *http.Request) {
		_ = httpjson.Write(w, 200, map[string]string{"status": "ok"})
	})
	r.Get("/ready", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), time.Second)
		defer cancel()
		if err := ready(ctx); err != nil {
			httpjson.Error(w, 503)
			return
		}
		_ = httpjson.Write(w, 200, map[string]string{"status": "ready"})
	})
	r.Handle("/metrics", promhttp.HandlerFor(registry, promhttp.HandlerOpts{}))
	serveSpec := func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/yaml")
		_, _ = w.Write(spec)
	}
	r.Get("/swagger/openapi.yaml", serveSpec)
	r.Get("/swagger/*", httpSwagger.Handler(httpSwagger.URL("/swagger/openapi.yaml")))
	prefix := "/docs/" + service
	r.Get(prefix+"/openapi.yaml", serveSpec)
	r.Get(prefix+"/*", httpSwagger.Handler(httpSwagger.URL(prefix+"/openapi.yaml")))
	r.NotFound(func(w http.ResponseWriter, r *http.Request) { httpjson.Error(w, 404) })
	r.MethodNotAllowed(func(w http.ResponseWriter, r *http.Request) { httpjson.Error(w, 405) })
	r.Mount("/", api)
	return &Runtime{Handler: r, Registry: registry}
}

// Schema permits additive migrations newer than this binary, supporting rollback
// of application images without rolling back the database.
func Schema(ctx context.Context, pool *pgxpool.Pool, minimum int64) error {
	var version int64
	var dirty bool
	if err := pool.QueryRow(ctx, "SELECT version, dirty FROM schema_migrations LIMIT 1").Scan(&version, &dirty); err != nil {
		return errors.New("database schema unavailable")
	}
	if dirty || version < minimum {
		return errors.New("database schema not ready")
	}
	return nil
}

func (r *Runtime) Serve(ctx context.Context, addr string) error {
	server := &http.Server{Addr: addr, Handler: r.Handler, ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 65 * time.Second, WriteTimeout: 70 * time.Second, IdleTimeout: 60 * time.Second}
	errorsCh := make(chan error, 1)
	go func() { errorsCh <- server.ListenAndServe() }()
	select {
	case err := <-errorsCh:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return fmt.Errorf("HTTP server failed: %w", err)
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			_ = server.Close()
			return errors.New("HTTP shutdown deadline exceeded")
		}
		return nil
	}
}
