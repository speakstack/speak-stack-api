import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SUCCESS_MESSAGE_KEY } from '../decorators/api-success-message.decorator';

interface SuccessResponse<T> {
  message: string;
  data: T | null;
}

const DEFAULT_SUCCESS_MESSAGE = 'Operation completed successfully';

/**
 * Global interceptor that transforms all successful responses
 * into a standardized format with message and data fields.
 * Always includes data field, defaulting to null when undefined.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponse<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    ctx: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    const successMessage = this.getSuccessMessage(ctx);
    return next.handle().pipe(
      map((data) => ({
        message: successMessage,
        data: data ?? null,
      })),
    );
  }

  private getSuccessMessage(ctx: ExecutionContext): string {
    const handlerMessage = this.reflector.get<string>(
      SUCCESS_MESSAGE_KEY,
      ctx.getHandler(),
    );
    if (handlerMessage) {
      return handlerMessage;
    }
    const classMessage = this.reflector.get<string>(
      SUCCESS_MESSAGE_KEY,
      ctx.getClass(),
    );
    return classMessage || DEFAULT_SUCCESS_MESSAGE;
  }
}
