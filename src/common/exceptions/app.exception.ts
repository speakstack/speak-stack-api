import { HttpException } from "@nestjs/common";
import { ErrorCode } from "../enums/error-code.enum";

export type ErrorDetails = string | Record<string, string>;

/**
 * Custom application exception that wraps ErrorCode enum.
 * Supports polymorphic details: string for generic errors,
 * Record<string, string> for validation errors.
 */
export class AppException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly details: ErrorDetails | null;

  constructor(errorCode: ErrorCode, details?: ErrorDetails) {
    super(
      {
        message: errorCode.message,
        errorCode: errorCode.code,
        details: details ?? null,
      },
      errorCode.httpStatus,
    );
    this.errorCode = errorCode;
    this.details = details ?? null;
  }
}
