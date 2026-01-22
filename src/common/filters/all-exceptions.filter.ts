import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { AppException, ErrorDetails } from "../exceptions/app.exception";
import { ErrorCode } from "../enums/error-code.enum";

interface ErrorResponse {
  message: string;
  error: {
    code: string;
    details: ErrorDetails | null;
  };
}

/**
 * Global exception filter that catches all exceptions and formats them
 * according to the standardized error response structure.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errorResponse = this.buildErrorResponse(exception);
    const httpStatus = this.getHttpStatus(exception);
    this.logException(exception, httpStatus);
    response.status(httpStatus).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown): ErrorResponse {
    if (exception instanceof AppException) {
      return this.handleAppException(exception);
    }
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }
    return this.handleUnknownException();
  }

  private handleAppException(exception: AppException): ErrorResponse {
    return {
      message: exception.errorCode.message,
      error: {
        code: exception.errorCode.code,
        details: exception.details,
      },
    };
  }

  private handleHttpException(exception: HttpException): ErrorResponse {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const message = this.extractMessage(exceptionResponse);
    const code = this.mapHttpStatusToErrorCode(status);
    return {
      message,
      error: {
        code: code.code,
        details: null,
      },
    };
  }

  private handleUnknownException(): ErrorResponse {
    return {
      message: ErrorCode.INTERNAL_ERROR.message,
      error: {
        code: ErrorCode.INTERNAL_ERROR.code,
        details: null,
      },
    };
  }

  private extractMessage(response: string | object): string {
    if (typeof response === "string") {
      return response;
    }
    if (typeof response === "object" && response !== null) {
      const responseObj = response as Record<string, unknown>;
      if (typeof responseObj.message === "string") {
        return responseObj.message;
      }
      if (Array.isArray(responseObj.message)) {
        return String(responseObj.message[0]) || "An error occurred";
      }
    }
    return "An error occurred";
  }

  private mapHttpStatusToErrorCode(status: number): ErrorCode {
    const statusMapping: Record<number, ErrorCode> = {
      [HttpStatus.BAD_REQUEST]: ErrorCode.VALIDATION_ERROR,
      [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
      [HttpStatus.NOT_FOUND]: ErrorCode.RESOURCE_NOT_FOUND,
      [HttpStatus.CONFLICT]: ErrorCode.RESOURCE_ALREADY_EXISTS,
    };
    return statusMapping[status] || ErrorCode.INTERNAL_ERROR;
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof AppException) {
      return exception.errorCode.httpStatus;
    }
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private logException(exception: unknown, status: number): void {
    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.error(
        `Unhandled exception: ${exception instanceof Error ? exception.message : "Unknown error"}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `Client error: ${exception instanceof Error ? exception.message : "Unknown error"}`,
      );
    }
  }
}
