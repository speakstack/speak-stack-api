import { Module } from "@nestjs/common";
import {
  PrometheusModule,
  makeHistogramProvider,
} from "@willsoto/nestjs-prometheus";

export const HTTP_REQUEST_DURATION = "http_request_duration_seconds";

const httpRequestDurationProvider = makeHistogramProvider({
  name: HTTP_REQUEST_DURATION,
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  // Standard web-latency buckets: 5ms → 10s
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

@Module({
  imports: [
    PrometheusModule.register({
      // Don't provide a controller: we serve /metrics from a separate
      // HTTP server on METRICS_PORT (see metrics-server.ts). The public API
      // port must never expose /metrics.
      defaultMetrics: {
        enabled: true,
      },
      defaultLabels: {
        service: "speak-stack-api",
        env: process.env.NODE_ENV ?? "production",
      },
    }),
  ],
  providers: [httpRequestDurationProvider],
  exports: [PrometheusModule, httpRequestDurationProvider],
})
export class MetricsModule {}
