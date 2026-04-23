import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { RequestContextService } from "./request-context.service";

const MAX_INCOMING_REQUEST_ID_LENGTH = 64;

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly requestContext: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.header("x-request-id");
    const requestId =
      incoming &&
      incoming.length > 0 &&
      incoming.length <= MAX_INCOMING_REQUEST_ID_LENGTH
        ? incoming
        : randomUUID();
    res.setHeader("x-request-id", requestId);
    this.requestContext.run(
      {
        requestId,
        method: req.method,
        url: req.originalUrl,
        startedAt: Date.now(),
      },
      () => next(),
    );
  }
}
