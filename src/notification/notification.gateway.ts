import { Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { OnEvent } from "@nestjs/event-emitter";
import { Server, Socket } from "socket.io";
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "../auth/types/tokens.type";
import { NOTIFICATION_EVENTS } from "./notification.types";
import type { NotificationEvent } from "./notification.types";

const ACCESS_TOKEN_SECRET = Bun.env.ACCESS_TOKEN_SECRET || "at-secret-key";

function userRoom(userId: string): string {
  return `user:${userId}`;
}

@WebSocketGateway({
  namespace: "/notifications",
  cors: { origin: true, credentials: true },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  handleConnection(client: Socket): void {
    const token = this.extractToken(client);
    if (!token) {
      this.logger.warn(`WS connect rejected: no token (${client.id})`);
      client.disconnect(true);
      return;
    }
    try {
      const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
      client.data.user = { sub: payload.sub };
      void client.join(userRoom(payload.sub));
      this.logger.log(`WS connected ${client.id} user=${payload.sub}`);
    } catch (err) {
      this.logger.warn(`WS connect rejected: ${(err as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`WS disconnected ${client.id}`);
  }

  @OnEvent(NOTIFICATION_EVENTS.ANSWER_CREATED)
  onAnswerCreated(event: NotificationEvent): void {
    this.server.to(userRoom(event.recipientId)).emit("notification", event);
  }

  @OnEvent(NOTIFICATION_EVENTS.COMMENT_CREATED)
  onCommentCreated(event: NotificationEvent): void {
    this.server.to(userRoom(event.recipientId)).emit("notification", event);
  }

  @OnEvent(NOTIFICATION_EVENTS.ANSWER_ACCEPTED)
  onAnswerAccepted(event: NotificationEvent): void {
    this.server.to(userRoom(event.recipientId)).emit("notification", event);
  }

  @OnEvent(NOTIFICATION_EVENTS.VOTE_RECEIVED)
  onVoteReceived(event: NotificationEvent): void {
    this.server.to(userRoom(event.recipientId)).emit("notification", event);
  }

  private extractToken(client: Socket): string | null {
    const auth = (client.handshake.auth ?? {}) as { token?: string };
    if (auth.token) return auth.token;
    const header = client.handshake.headers.authorization;
    if (header?.startsWith("Bearer ")) return header.slice(7);
    return null;
  }
}
