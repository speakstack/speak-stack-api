import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: { sub?: number };
}

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
      const meta = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        userId: req.user?.sub,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      };
      if (res.statusCode >= 500) {
        this.logger.error(line, meta);
      } else if (res.statusCode >= 400) {
        this.logger.warn(line, meta);
      } else {
        this.logger.log(line, meta);
      }
    });
    next();
  }
}
