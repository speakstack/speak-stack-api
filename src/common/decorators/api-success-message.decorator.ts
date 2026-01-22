import { SetMetadata } from "@nestjs/common";

export const SUCCESS_MESSAGE_KEY = "success_message";

/**
 * Decorator to set a custom success message for API responses.
 * Used by TransformInterceptor to customize the response message.
 * @param message - The success message to return in the response
 */
export const ApiSuccessMessage = (message: string) =>
  SetMetadata(SUCCESS_MESSAGE_KEY, message);
