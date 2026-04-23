import { Logger, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "../../auth/types/tokens.type";
import { WsJwtGuard } from "../guards/ws-jwt.guard";
import { ChatService } from "../chat.service";
import { AppException } from "../../common/exceptions/app.exception";
import {
  ChannelRoomPayloadDto,
  DeleteMessagePayloadDto,
  EditMessagePayloadDto,
  SendMessagePayloadDto,
} from "../dto/message.dto";

const ACCESS_TOKEN_SECRET = Bun.env.ACCESS_TOKEN_SECRET || "at-secret-key";

function roomName(channelId: string): string {
  return `channel:${channelId}`;
}

type WsAck<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

function okAck<T>(data: T): WsAck<T> {
  return { ok: true, data };
}

function errorAck(err: unknown): WsAck<never> {
  if (err instanceof AppException) {
    return {
      ok: false,
      error: { code: err.errorCode.code, message: err.errorCode.message },
    };
  }
  console.error("[ChatGateway] non-AppException:", err);
  return {
    ok: false,
    error: { code: "INTERNAL_ERROR", message: "Internal error" },
  };
}

@WebSocketGateway({
  namespace: "/chat",
  cors: { origin: true, credentials: true },
})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

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
      this.logger.log(`WS connected ${client.id} user=${payload.sub}`);
    } catch (err) {
      this.logger.warn(`WS connect rejected: ${(err as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`WS disconnected ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("channel:join")
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: ChannelRoomPayloadDto,
  ): Promise<WsAck<{ channelId: string }>> {
    try {
      await this.chatService.getChannel(body.channelId);
      await client.join(roomName(body.channelId));
      return okAck({ channelId: body.channelId });
    } catch (err) {
      return errorAck(err);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("channel:leave")
  async onLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: ChannelRoomPayloadDto,
  ): Promise<WsAck<{ channelId: string }>> {
    await client.leave(roomName(body.channelId));
    return okAck({ channelId: body.channelId });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("message:send")
  async onSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: SendMessagePayloadDto,
  ): Promise<WsAck<{ messageId: string }>> {
    try {
      const user = client.data.user as JwtPayload;
      const msg = await this.chatService.sendMessage(user.sub, body);
      this.server
        .to(roomName(msg.channelId))
        .emit("message:new", { message: msg });
      return okAck({ messageId: msg.id });
    } catch (err) {
      return errorAck(err);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("message:edit")
  async onEdit(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: EditMessagePayloadDto,
  ): Promise<WsAck<{ messageId: string }>> {
    try {
      const user = client.data.user as JwtPayload;
      const msg = await this.chatService.editMessage(user.sub, body);
      this.server
        .to(roomName(msg.channelId))
        .emit("message:updated", { message: msg });
      return okAck({ messageId: msg.id });
    } catch (err) {
      return errorAck(err);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("message:delete")
  async onDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: DeleteMessagePayloadDto,
  ): Promise<WsAck<{ messageId: string }>> {
    try {
      const user = client.data.user as JwtPayload;
      const result = await this.chatService.deleteMessage(user.sub, body);
      this.server
        .to(roomName(result.channelId))
        .emit("message:deleted", result);
      return okAck({ messageId: result.messageId });
    } catch (err) {
      return errorAck(err);
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
