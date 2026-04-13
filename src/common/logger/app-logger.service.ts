import {
  ConsoleLogger,
  Injectable,
  LogLevel,
  Scope,
} from "@nestjs/common";
import { RequestContextService } from "./request-context.service";

type LogParam = unknown;

const VALID_LEVELS: LogLevel[] = [
  "error",
  "warn",
  "log",
  "debug",
  "verbose",
];

function resolveLogLevels(): LogLevel[] {
  const envLevel = (Bun.env.LOG_LEVEL || "").toLowerCase() as LogLevel;
  const fallback: LogLevel =
    Bun.env.NODE_ENV === "production" ? "log" : "debug";
  const chosen = VALID_LEVELS.includes(envLevel) ? envLevel : fallback;
  const idx = VALID_LEVELS.indexOf(chosen);
  return VALID_LEVELS.slice(0, idx + 1);
}

function isJsonMode(): boolean {
  return Bun.env.NODE_ENV === "production";
}

interface JsonLogRecord {
  timestamp: string;
  level: LogLevel;
  context?: string;
  message: string;
  requestId?: string;
  userId?: number;
  pid: number;
  stack?: string;
  [key: string]: unknown;
}

@Injectable({ scope: Scope.DEFAULT })
export class AppLogger extends ConsoleLogger {
  constructor(private readonly requestContext: RequestContextService) {
    super("App", { logLevels: resolveLogLevels() });
  }

  log(message: unknown, ...params: LogParam[]): void {
    if (isJsonMode()) {
      this.emitJson("log", message, params);
      return;
    }
    super.log(message as string, ...(this.appendContextSuffix(params) as []));
  }

  error(message: unknown, ...params: LogParam[]): void {
    if (isJsonMode()) {
      this.emitJson("error", message, params);
      return;
    }
    super.error(message as string, ...(this.appendContextSuffix(params) as []));
  }

  warn(message: unknown, ...params: LogParam[]): void {
    if (isJsonMode()) {
      this.emitJson("warn", message, params);
      return;
    }
    super.warn(message as string, ...(this.appendContextSuffix(params) as []));
  }

  debug(message: unknown, ...params: LogParam[]): void {
    if (isJsonMode()) {
      this.emitJson("debug", message, params);
      return;
    }
    super.debug(message as string, ...(this.appendContextSuffix(params) as []));
  }

  verbose(message: unknown, ...params: LogParam[]): void {
    if (isJsonMode()) {
      this.emitJson("verbose", message, params);
      return;
    }
    super.verbose(message as string, ...(this.appendContextSuffix(params) as []));
  }

  private appendContextSuffix(params: LogParam[]): LogParam[] {
    const store = this.requestContext.get();
    if (!store) {
      return params;
    }
    const parts: string[] = [`req=${store.requestId}`];
    if (store.userId !== undefined) {
      parts.push(`user=${store.userId}`);
    }
    const suffix = ` [${parts.join(" ")}]`;
    const last = params[params.length - 1];
    if (typeof last === "string") {
      params[params.length - 1] = `${last}${suffix}`;
      return params;
    }
    return [...params, suffix];
  }

  private emitJson(
    level: LogLevel,
    rawMessage: unknown,
    params: LogParam[],
  ): void {
    if (!this.isLevelEnabled(level)) {
      return;
    }
    const store = this.requestContext.get();
    const { context, extras, stack } = this.partitionParams(params);
    const messageText =
      typeof rawMessage === "string" ? rawMessage : JSON.stringify(rawMessage);
    const record: JsonLogRecord = {
      timestamp: new Date().toISOString(),
      level,
      context: context ?? this.context,
      message: messageText,
      pid: process.pid,
    };
    if (store) {
      record.requestId = store.requestId;
      if (store.userId !== undefined) {
        record.userId = store.userId;
      }
    }
    if (stack) {
      record.stack = stack;
    }
    if (extras) {
      Object.assign(record, extras);
    }
    const line = JSON.stringify(record);
    if (level === "error") {
      process.stderr.write(line + "\n");
    } else {
      process.stdout.write(line + "\n");
    }
  }

  private partitionParams(params: LogParam[]): {
    context?: string;
    extras?: Record<string, unknown>;
    stack?: string;
  } {
    let context: string | undefined;
    let stack: string | undefined;
    let extras: Record<string, unknown> | undefined;
    for (const param of params) {
      if (typeof param === "string") {
        if (param.includes("\n") && !stack) {
          stack = param;
        } else {
          context = param;
        }
      } else if (param && typeof param === "object") {
        extras = { ...(extras ?? {}), ...(param as Record<string, unknown>) };
      }
    }
    return { context, extras, stack };
  }
}
