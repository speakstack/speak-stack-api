import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

export interface JwtPayloadWithRefreshToken extends JwtPayload {
  refreshToken: string;
}

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

/**
 * Parameter decorator specifically for refresh token endpoints.
 * Extracts user ID and refresh token from request.
 */
export const GetCurrentUserWithRefreshToken = createParamDecorator(
  (_data: undefined, ctx: ExecutionContext): JwtPayloadWithRefreshToken => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;
    const refreshToken = request.headers.authorization
      ?.replace("Bearer ", "")
      .trim();
    return {
      ...user,
      refreshToken: refreshToken || "",
    };
  },
);
