import { NestFactory, Reflector } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationError } from "class-validator";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { AppException } from "./common/exceptions/app.exception";
import { ErrorCode } from "./common/enums/error-code.enum";

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
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });
  app.enableCors({
    origin: Bun.env.CORS_ORIGIN || "*",
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
  const port = Bun.env.PORT || DEFAULT_PORT;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/docs`);
  logger.log(`Health check: http://localhost:${port}/health`);
  logger.log(`API endpoints: http://localhost:${port}/api`);
}

void bootstrap();
