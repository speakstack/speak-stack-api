import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Socket } from "socket.io";
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "../../auth/types/tokens.type";

const ACCESS_TOKEN_SECRET = Bun.env.ACCESS_TOKEN_SECRET || "at-secret-key";

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  canActivate(ctx: ExecutionContext): boolean {
    const client = ctx.switchToWs().getClient<Socket>();
    const existing = client.data.user as JwtPayload | undefined;
    if (existing?.sub) return true;

    const token = this.extractToken(client);
    if (!token) return false;

    try {
      const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
      client.data.user = { sub: payload.sub };
      return true;
    } catch (err) {
      this.logger.warn(`WS auth failed: ${(err as Error).message}`);
      return false;
    }
  }

  private extractToken(client: Socket): string | null {
    const auth = (client.handshake.auth ?? {}) as { token?: string };
    if (auth.token) return auth.token;
    const header = client.handshake.headers.authorization;
    if (header?.startsWith("Bearer ")) return header.slice(7);
    return null;
  }
}
