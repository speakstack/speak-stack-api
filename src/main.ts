import { NestFactory, Reflector } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationError } from "class-validator";
import * as path from "path";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { AppLogger } from "./common/logger/app-logger.service";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { AppException } from "./common/exceptions/app.exception";
import { ErrorCode } from "./common/enums/error-code.enum";
import { startMetricsServer } from "./common/metrics/metrics-server";

const DEFAULT_PORT = Bun.env.PORT || 8080;

/**
 * Flattens class-validator errors into a simple map.
 * Transforms: [{ property: 'email', constraints: { isEmail: 'Invalid' } }]
 * Into: { email: 'Invalid' }
 */
function flattenValidationErrors(
  errors: ValidationError[],
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const error of errors) {
    if (error.constraints) {
      const constraintValues = Object.values(error.constraints);
      result[error.property] = constraintValues[0];
    }
    if (error.children && error.children.length > 0) {
      const nestedErrors = flattenValidationErrors(error.children);
      for (const [key, value] of Object.entries(nestedErrors)) {
        result[`${error.property}.${key}`] = value;
      }
    }
  }
  return result;
}

function setupSwagger(
  app: Awaited<ReturnType<typeof NestFactory.create>>,
): void {
  const config = new DocumentBuilder()
    .setTitle("Speak Stack API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const appLogger = await app.resolve(AppLogger);
  app.useLogger(appLogger);
  app.set("trust proxy", true);
  const logger = appLogger;
  app.useStaticAssets(path.join(process.cwd(), "uploads"), {
    prefix: "/uploads",
  });
  const corsOrigin = Bun.env.CORS_ORIGIN || "http://localhost:3000";
  const isWildcard = corsOrigin.trim() === "*";
  const allowedOrigins = isWildcard
    ? []
    : corsOrigin.split(",").map((o) => o.trim());
  app.enableCors({
    origin: isWildcard
      ? true
      : (
          origin: string | undefined,
          callback: (err: Error | null, allow?: boolean) => void,
        ) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });
  app.setGlobalPrefix("api", {
    exclude: ["health", "docs", "docs-json", "docs-yaml"],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const flattenedErrors = flattenValidationErrors(errors);
        return new AppException(ErrorCode.VALIDATION_ERROR, flattenedErrors);
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  setupSwagger(app);
  await startMetricsServer();
  const port = Bun.env.PORT || DEFAULT_PORT;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/docs`);
  logger.log(`Health check: http://localhost:${port}/health`);
  logger.log(`API endpoints: http://localhost:${port}/api`);
}

void bootstrap();
