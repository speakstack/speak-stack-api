import { Injectable, NestMiddleware } from "@nestjs/common";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Histogram } from "prom-client";
import { NextFunction, Request, Response } from "express";
import { HTTP_REQUEST_DURATION } from "./metrics.module";

type RouteRequest = Request & { route?: { path?: string } };

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  constructor(
    @InjectMetric(HTTP_REQUEST_DURATION)
    private readonly histogram: Histogram<string>,
  ) {}

  use(req: RouteRequest, res: Response, next: NextFunction): void {
    const start = Date.now();
    res.on("finish", () => {
      const durationSeconds = (Date.now() - start) / 1000;
      this.histogram.observe(
        {
          method: req.method,
          route: req.route?.path ?? "unmatched",
          status_code: String(res.statusCode),
        },
        durationSeconds,
      );
    });
    next();
  }
}
