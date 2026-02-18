import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { JwtPayload } from "../../auth/types/tokens.type";

/**
 * Parameter decorator to extract current user from JWT payload.
 * Can extract specific property or entire payload.
 * @param data - Optional property key to extract from payload
 */
export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;
    if (!user) {
      return null;
    }
    if (data) {
      return user[data];
    }
    return user;
  },
);
