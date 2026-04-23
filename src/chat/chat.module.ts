import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "./entities/channel.entity";
import { ChatMessage } from "./entities/chat-message.entity";
import { ChatMessageAttachment } from "./entities/chat-message-attachment.entity";
import { User } from "../user/entities/user.entity";
import { Language } from "../language/entities/language.entity";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./gateways/chat.gateway";
import { WsJwtGuard } from "./guards/ws-jwt.guard";
import { AdminGuard } from "../common/guards/admin.guard";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Channel,
      ChatMessage,
      ChatMessageAttachment,
      User,
      Language,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, AdminGuard, ChatGateway, WsJwtGuard],
  exports: [ChatService],
})
export class ChatModule {}
