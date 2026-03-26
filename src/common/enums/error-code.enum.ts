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
  GOOGLE_AUTH_FAILED: {
    httpStatus: HttpStatus.UNAUTHORIZED,
    message: "Google authentication failed",
  },
  GOOGLE_AUTH_CONFIG_ERROR: {
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Google authentication is not configured",
  },
  PASSWORD_NOT_SET: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "No password set. Sign in with Google or set a password first",
  },
  PASSWORD_ALREADY_SET: {
    httpStatus: HttpStatus.CONFLICT,
    message: "Password is already set",
  },
  // OTP verification errors
  OTP_COOLDOWN: {
    httpStatus: HttpStatus.TOO_MANY_REQUESTS,
    message: "Please wait before requesting a new code",
  },
  OTP_RATE_LIMITED: {
    httpStatus: HttpStatus.TOO_MANY_REQUESTS,
    message: "Too many OTP requests, try again later",
  },
  OTP_EXPIRED: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Verification code has expired",
  },
  OTP_INVALID: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Invalid verification code",
  },
  OTP_MAX_ATTEMPTS_EXCEEDED: {
    httpStatus: HttpStatus.TOO_MANY_REQUESTS,
    message: "Too many failed attempts, try again later",
  },
  INVALID_VERIFICATION: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Invalid or expired verification",
  },
  EMAIL_NOT_VERIFIED: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Email has not been verified",
  },
  MAIL_SERVICE_ERROR: {
    httpStatus: HttpStatus.BAD_GATEWAY,
    message: "Email service is temporarily unavailable",
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
  USERNAME_ALREADY_SET: {
    httpStatus: HttpStatus.CONFLICT,
    message: "Username has already been set and cannot be changed",
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
  // Comment errors
  COMMENT_NOT_FOUND: {
    httpStatus: HttpStatus.NOT_FOUND,
    message: "Comment not found",
  },
  // Tag errors
  TAG_NOT_FOUND: {
    httpStatus: HttpStatus.NOT_FOUND,
    message: "One or more tags not found",
  },
  // Language errors
  LANGUAGE_NOT_FOUND: {
    httpStatus: HttpStatus.NOT_FOUND,
    message: "Language not found",
  },
  // User language errors
  USER_LANGUAGE_NOT_FOUND: {
    httpStatus: HttpStatus.NOT_FOUND,
    message: "User language relation not found",
  },
  USER_LANGUAGE_ALREADY_EXISTS: {
    httpStatus: HttpStatus.CONFLICT,
    message: "This language is already added for this user",
  },
  NATIVE_LANGUAGE_LIMIT: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Maximum 1 native language allowed",
  },
  LEARNING_LANGUAGE_LIMIT: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Maximum 5 learning languages allowed",
  },
  CAN_HELP_LANGUAGE_LIMIT: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Maximum 5 can_help languages allowed",
  },
  // Attachment errors
  ATTACHMENT_NOT_FOUND: {
    httpStatus: HttpStatus.NOT_FOUND,
    message: "Attachment not found",
  },
  ATTACHMENT_LIMIT_EXCEEDED: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Maximum 10 attachments per post",
  },
  INVALID_FILE_TYPE: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "File type not allowed",
  },
  FILE_TOO_LARGE: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "File size must not exceed 10 MB",
  },
  // Grammar check errors
  GRAMMAR_API_CONFIG_ERROR: {
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Grammar check service is not configured",
  },
  GRAMMAR_API_ERROR: {
    httpStatus: HttpStatus.BAD_GATEWAY,
    message: "Grammar check service is temporarily unavailable",
  },
  GRAMMAR_RATE_LIMITED: {
    httpStatus: HttpStatus.TOO_MANY_REQUESTS,
    message: "Grammar check rate limit exceeded, please try again later",
  },
  // Vote errors
  SELF_VOTE_NOT_ALLOWED: {
    httpStatus: HttpStatus.FORBIDDEN,
    message: "You cannot vote on your own content",
  },
  INVALID_VOTE_VALUE: {
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Vote value must be 1, -1, or 0",
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
  static readonly GOOGLE_AUTH_FAILED = new ErrorCode("GOOGLE_AUTH_FAILED");
  static readonly GOOGLE_AUTH_CONFIG_ERROR = new ErrorCode("GOOGLE_AUTH_CONFIG_ERROR");
  static readonly PASSWORD_NOT_SET = new ErrorCode("PASSWORD_NOT_SET");
  static readonly PASSWORD_ALREADY_SET = new ErrorCode("PASSWORD_ALREADY_SET");
  // OTP verification errors
  static readonly OTP_COOLDOWN = new ErrorCode("OTP_COOLDOWN");
  static readonly OTP_RATE_LIMITED = new ErrorCode("OTP_RATE_LIMITED");
  static readonly OTP_EXPIRED = new ErrorCode("OTP_EXPIRED");
  static readonly OTP_INVALID = new ErrorCode("OTP_INVALID");
  static readonly OTP_MAX_ATTEMPTS_EXCEEDED = new ErrorCode("OTP_MAX_ATTEMPTS_EXCEEDED");
  static readonly INVALID_VERIFICATION = new ErrorCode("INVALID_VERIFICATION");
  static readonly EMAIL_NOT_VERIFIED = new ErrorCode("EMAIL_NOT_VERIFIED");
  static readonly MAIL_SERVICE_ERROR = new ErrorCode("MAIL_SERVICE_ERROR");
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
  static readonly USERNAME_ALREADY_SET = new ErrorCode("USERNAME_ALREADY_SET");
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
  // Comment errors
  static readonly COMMENT_NOT_FOUND = new ErrorCode("COMMENT_NOT_FOUND");
  // Tag errors
  static readonly TAG_NOT_FOUND = new ErrorCode("TAG_NOT_FOUND");
  // Language errors
  static readonly LANGUAGE_NOT_FOUND = new ErrorCode("LANGUAGE_NOT_FOUND");
  // User language errors
  static readonly USER_LANGUAGE_NOT_FOUND = new ErrorCode(
    "USER_LANGUAGE_NOT_FOUND",
  );
  static readonly USER_LANGUAGE_ALREADY_EXISTS = new ErrorCode(
    "USER_LANGUAGE_ALREADY_EXISTS",
  );
  static readonly NATIVE_LANGUAGE_LIMIT = new ErrorCode(
    "NATIVE_LANGUAGE_LIMIT",
  );
  static readonly LEARNING_LANGUAGE_LIMIT = new ErrorCode(
    "LEARNING_LANGUAGE_LIMIT",
  );
  static readonly CAN_HELP_LANGUAGE_LIMIT = new ErrorCode(
    "CAN_HELP_LANGUAGE_LIMIT",
  );
  // Attachment errors
  static readonly ATTACHMENT_NOT_FOUND = new ErrorCode("ATTACHMENT_NOT_FOUND");
  static readonly ATTACHMENT_LIMIT_EXCEEDED = new ErrorCode(
    "ATTACHMENT_LIMIT_EXCEEDED",
  );
  static readonly INVALID_FILE_TYPE = new ErrorCode("INVALID_FILE_TYPE");
  static readonly FILE_TOO_LARGE = new ErrorCode("FILE_TOO_LARGE");
  // Grammar check errors
  static readonly GRAMMAR_API_CONFIG_ERROR = new ErrorCode(
    "GRAMMAR_API_CONFIG_ERROR",
  );
  static readonly GRAMMAR_API_ERROR = new ErrorCode("GRAMMAR_API_ERROR");
  static readonly GRAMMAR_RATE_LIMITED = new ErrorCode("GRAMMAR_RATE_LIMITED");
  // Vote errors
  static readonly SELF_VOTE_NOT_ALLOWED = new ErrorCode("SELF_VOTE_NOT_ALLOWED");
  static readonly INVALID_VOTE_VALUE = new ErrorCode("INVALID_VOTE_VALUE");
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
