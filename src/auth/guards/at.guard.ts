import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "../../common/decorators/public.decorator";
import { AppException } from "../../common/exceptions/app.exception";
import { ErrorCode } from "../../common/enums/error-code.enum";
import { RequestContextService } from "../../common/logger/request-context.service";

/**
 * Access Token Guard registered globally.
 * Validates JWT access tokens for all routes except those marked with @Public().
 * For public routes, attempts to extract user from token without failing if absent.
 */
@Injectable()
export class AtGuard extends AuthGuard("jwt") {
  constructor(
    private readonly reflector: Reflector,
    private readonly requestContext: RequestContextService,
  ) {
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
      const req = ctx.switchToHttp().getRequest();
      const authHeader = req.headers?.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return true;
      }
      return Promise.resolve(super.canActivate(ctx))
        .then(() => true)
        .catch(() => true);
    }
    return super.canActivate(ctx);
  }

  handleRequest<T>(err: Error | null, user: T, _info: unknown, context: ExecutionContext): T {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      if (user && typeof user === "object") {
        const sub = (user as { sub?: number }).sub;
        if (typeof sub === "number") {
          this.requestContext.setUserId(sub);
        }
      }
      return user;
    }
    if (err || !user) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }
    if (user && typeof user === "object") {
      const sub = (user as { sub?: number }).sub;
      if (typeof sub === "number") {
        this.requestContext.setUserId(sub);
      }
    }
    return user;
  }
}
