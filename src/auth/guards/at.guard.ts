import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "../../common/decorators/public.decorator";
import { AppException } from "../../common/exceptions/app.exception";
import { ErrorCode } from "../../common/enums/error-code.enum";

/**
 * Access Token Guard registered globally.
 * Validates JWT access tokens for all routes except those marked with @Public().
 */
@Injectable()
export class AtGuard extends AuthGuard("jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(ctx);
  }

  handleRequest<T>(err: Error | null, user: T): T {
    if (err || !user) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }
    return user;
  }
}
