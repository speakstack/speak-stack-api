import { HttpStatus } from "@nestjs/common";

interface ErrorCodeDefinition {
  readonly httpStatus: HttpStatus;
  readonly message: string;
}

const ERROR_CODE_DEFINITIONS = {
  // Validation errors
  VALIDATION_ERROR: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Validation failed",
  },
  INVALID_SORT_FIELD: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Invalid sort field provided",
  },
  // Authentication errors
  UNAUTHORIZED: {
    httpStatus: HttpStatus.UNAUTHORIZED,
    message: "Authentication required",
  },
  USER_NOT_FOUND: {
    httpStatus: HttpStatus.UNAUTHORIZED,
    message: "User not found",
  },
  INVALID_PASSWORD: {
    httpStatus: HttpStatus.UNAUTHORIZED,
    message: "Invalid password",
  },
  INVALID_REFRESH_TOKEN: {
    httpStatus: HttpStatus.UNAUTHORIZED,
    message: "Invalid refresh token",
  },
  REFRESH_TOKEN_EXPIRED: {
    httpStatus: HttpStatus.UNAUTHORIZED,
    message: "Refresh token has expired",
  },
  TOKEN_EXPIRED: {
    httpStatus: HttpStatus.UNAUTHORIZED,
    message: "Token has expired",
  },
  // Authorization errors
  FORBIDDEN: {
    httpStatus: HttpStatus.FORBIDDEN,
    message: "Access denied",
  },
  USER_INACTIVE: {
    httpStatus: HttpStatus.FORBIDDEN,
    message: "User account is inactive",
  },
  // Not found errors
  RESOURCE_NOT_FOUND: {
    httpStatus: HttpStatus.NOT_FOUND,
    message: "Resource not found",
  },
  // Conflict errors
  RESOURCE_ALREADY_EXISTS: {
    httpStatus: HttpStatus.CONFLICT,
    message: "Resource already exists",
  },
  EMAIL_ALREADY_EXISTS: {
    httpStatus: HttpStatus.CONFLICT,
    message: "Email is already registered",
  },
  USERNAME_ALREADY_EXISTS: {
    httpStatus: HttpStatus.CONFLICT,
    message: "Username is already taken",
  },
  // Post errors
  POST_NOT_FOUND: {
    httpStatus: HttpStatus.NOT_FOUND,
    message: "Post not found",
  },
  POST_EDIT_WINDOW_EXPIRED: {
    httpStatus: HttpStatus.FORBIDDEN,
    message: "Posts can only be edited within 24 hours of creation",
  },
  POST_HAS_ACCEPTED_ANSWER: {
    httpStatus: HttpStatus.FORBIDDEN,
    message: "Cannot edit a post that has an accepted answer",
  },
  POST_CLOSED: {
    httpStatus: HttpStatus.FORBIDDEN,
    message: "This post is closed",
  },
  // Answer errors
  ANSWER_NOT_FOUND: {
    httpStatus: HttpStatus.NOT_FOUND,
    message: "Answer not found",
  },
  SELF_ANSWER_NOT_ALLOWED: {
    httpStatus: HttpStatus.FORBIDDEN,
    message: "You cannot answer your own post",
  },
  CANNOT_DELETE_ACCEPTED_ANSWER: {
    httpStatus: HttpStatus.FORBIDDEN,
    message:
      "Cannot delete an accepted answer. The post author must unaccept it first.",
  },
  NO_ACCEPTED_ANSWER: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "This post has no accepted answer",
  },
  // Tag errors
  TAG_NOT_FOUND: {
    httpStatus: HttpStatus.NOT_FOUND,
    message: "One or more tags not found",
  },
  // Server errors
  INTERNAL_ERROR: {
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
  },
} as const;

export type ErrorCodeKey = keyof typeof ERROR_CODE_DEFINITIONS;

export class ErrorCode {
  // Validation errors
  static readonly VALIDATION_ERROR = new ErrorCode("VALIDATION_ERROR");
  static readonly INVALID_SORT_FIELD = new ErrorCode("INVALID_SORT_FIELD");
  // Authentication errors
  static readonly UNAUTHORIZED = new ErrorCode("UNAUTHORIZED");
  static readonly USER_NOT_FOUND = new ErrorCode("USER_NOT_FOUND");
  static readonly INVALID_PASSWORD = new ErrorCode("INVALID_PASSWORD");
  static readonly INVALID_REFRESH_TOKEN = new ErrorCode(
    "INVALID_REFRESH_TOKEN",
  );
  static readonly REFRESH_TOKEN_EXPIRED = new ErrorCode(
    "REFRESH_TOKEN_EXPIRED",
  );
  static readonly TOKEN_EXPIRED = new ErrorCode("TOKEN_EXPIRED");
  // Authorization errors
  static readonly FORBIDDEN = new ErrorCode("FORBIDDEN");
  static readonly USER_INACTIVE = new ErrorCode("USER_INACTIVE");
  // Not found errors
  static readonly RESOURCE_NOT_FOUND = new ErrorCode("RESOURCE_NOT_FOUND");
  // Conflict errors
  static readonly RESOURCE_ALREADY_EXISTS = new ErrorCode(
    "RESOURCE_ALREADY_EXISTS",
  );
  static readonly EMAIL_ALREADY_EXISTS = new ErrorCode("EMAIL_ALREADY_EXISTS");
  static readonly USERNAME_ALREADY_EXISTS = new ErrorCode(
    "USERNAME_ALREADY_EXISTS",
  );
  // Post errors
  static readonly POST_NOT_FOUND = new ErrorCode("POST_NOT_FOUND");
  static readonly POST_EDIT_WINDOW_EXPIRED = new ErrorCode(
    "POST_EDIT_WINDOW_EXPIRED",
  );
  static readonly POST_HAS_ACCEPTED_ANSWER = new ErrorCode(
    "POST_HAS_ACCEPTED_ANSWER",
  );
  static readonly POST_CLOSED = new ErrorCode("POST_CLOSED");
  // Answer errors
  static readonly ANSWER_NOT_FOUND = new ErrorCode("ANSWER_NOT_FOUND");
  static readonly SELF_ANSWER_NOT_ALLOWED = new ErrorCode(
    "SELF_ANSWER_NOT_ALLOWED",
  );
  static readonly CANNOT_DELETE_ACCEPTED_ANSWER = new ErrorCode(
    "CANNOT_DELETE_ACCEPTED_ANSWER",
  );
  static readonly NO_ACCEPTED_ANSWER = new ErrorCode("NO_ACCEPTED_ANSWER");
  // Tag errors
  static readonly TAG_NOT_FOUND = new ErrorCode("TAG_NOT_FOUND");
  // Server errors
  static readonly INTERNAL_ERROR = new ErrorCode("INTERNAL_ERROR");

  private readonly definition: ErrorCodeDefinition;

  private constructor(public readonly code: ErrorCodeKey) {
    this.definition = ERROR_CODE_DEFINITIONS[code];
  }

  get httpStatus(): HttpStatus {
    return this.definition.httpStatus;
  }

  get message(): string {
    return this.definition.message;
  }
}
