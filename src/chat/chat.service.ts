import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, IsNull, QueryFailedError, Repository } from "typeorm";
import { randomUUID } from "crypto";
import * as path from "path";
import * as fs from "fs/promises";
import { Channel } from "./entities/channel.entity";
import { ChatMessage } from "./entities/chat-message.entity";
import { ChatMessageAttachment } from "./entities/chat-message-attachment.entity";
import { Language } from "../language/entities/language.entity";
import { AppException } from "../common/exceptions/app.exception";
import { ErrorCode } from "../common/enums/error-code.enum";
import { sanitizeContent } from "../common/utils/sanitize";
import {
  ChannelListResponseDto,
  ChannelResponseDto,
  CreateChannelDto,
  ListChannelsQueryDto,
  UpdateChannelDto,
} from "./dto/channel.dto";
import { AttachmentResponseDto } from "./dto/attachment.dto";
import {
  DeleteMessagePayloadDto,
  EditMessagePayloadDto,
  ListMessagesQueryDto,
  MessageListResponseDto,
  MessageResponseDto,
  SendMessagePayloadDto,
} from "./dto/message.dto";

const CHAT_UPLOAD_ROOT = path.join(process.cwd(), "uploads", "chat");
const MAX_CHAT_FILE_BYTES = 10 * 1024 * 1024;
const MAX_ATTACHMENTS_PER_MESSAGE = 4;
const DEFAULT_MESSAGE_PAGE_SIZE = 50;
const MAX_MESSAGE_PAGE_SIZE = 100;
const ALLOWED_CHAT_MIME_PREFIXES = ["image/", "audio/"];
const ALLOWED_CHAT_MIME_EXACT = ["video/mp4", "application/pdf"];

function isAllowedChatMime(mime: string): boolean {
  return (
    ALLOWED_CHAT_MIME_PREFIXES.some((p) => mime.startsWith(p)) ||
    ALLOWED_CHAT_MIME_EXACT.includes(mime)
  );
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
    @InjectRepository(ChatMessageAttachment)
    private readonly attachmentRepository: Repository<ChatMessageAttachment>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    private readonly dataSource: DataSource,
  ) {}

  async createChannel(
    creatorId: string,
    dto: CreateChannelDto,
  ): Promise<ChannelResponseDto> {
    if (dto.languageId) {
      const lang = await this.languageRepository.findOne({
        where: { id: dto.languageId },
      });
      if (!lang) throw new AppException(ErrorCode.LANGUAGE_NOT_FOUND);
    }
    try {
      const channel = await this.channelRepository.save(
        this.channelRepository.create({
          slug: dto.slug,
          name: dto.name,
          description: dto.description ?? null,
          languageId: dto.languageId ?? null,
          createdById: creatorId,
        }),
      );
      this.logger.log(
        `Channel ${channel.id} (${channel.slug}) created by ${creatorId}`,
      );
      return this.toChannelResponse(channel);
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        (err as QueryFailedError & { detail?: string }).detail?.includes("slug")
      ) {
        throw new AppException(ErrorCode.CHANNEL_SLUG_TAKEN);
      }
      throw err;
    }
  }

  async updateChannel(
    id: string,
    dto: UpdateChannelDto,
  ): Promise<ChannelResponseDto> {
    const channel = await this.channelRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!channel) throw new AppException(ErrorCode.CHANNEL_NOT_FOUND);

    if (dto.languageId !== undefined) {
      if (dto.languageId !== null) {
        const lang = await this.languageRepository.findOne({
          where: { id: dto.languageId },
        });
        if (!lang) throw new AppException(ErrorCode.LANGUAGE_NOT_FOUND);
      }
      channel.languageId = dto.languageId;
    }
    if (dto.name !== undefined) channel.name = dto.name;
    if (dto.description !== undefined) {
      channel.description = dto.description ?? null;
    }
    const saved = await this.channelRepository.save(channel);
    return this.toChannelResponse(saved);
  }

  async softDeleteChannel(id: string): Promise<void> {
    const channel = await this.channelRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!channel) throw new AppException(ErrorCode.CHANNEL_NOT_FOUND);
    await this.channelRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    this.logger.log(`Channel ${id} soft-deleted`);
  }

  async listChannels(
    query: ListChannelsQueryDto,
  ): Promise<ChannelListResponseDto> {
    const qb = this.channelRepository
      .createQueryBuilder("c")
      .where("c.isDeleted = false")
      .orderBy("c.createdAt", "ASC");
    if (query.languageId) {
      qb.andWhere("c.languageId = :lid", { lid: query.languageId });
    }
    const channels = await qb.getMany();
    return { channels: channels.map((c) => this.toChannelResponse(c)) };
  }

  async getChannel(id: string): Promise<ChannelResponseDto> {
    const channel = await this.channelRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!channel) throw new AppException(ErrorCode.CHANNEL_NOT_FOUND);
    return this.toChannelResponse(channel);
  }

  async uploadAttachment(
    userId: string,
    file: Express.Multer.File,
  ): Promise<AttachmentResponseDto> {
    if (!file) {
      throw new AppException(ErrorCode.VALIDATION_ERROR, {
        file: "File is required",
      });
    }
    if (file.size > MAX_CHAT_FILE_BYTES) {
      throw new AppException(ErrorCode.FILE_TOO_LARGE);
    }
    if (!isAllowedChatMime(file.mimetype)) {
      throw new AppException(ErrorCode.INVALID_FILE_TYPE);
    }
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const dir = path.join(CHAT_UPLOAD_ROOT, year, month);
    await fs.mkdir(dir, { recursive: true });

    const ext = path.extname(file.originalname) || "";
    const storedName = `${randomUUID()}${ext}`;
    const absPath = path.join(dir, storedName);
    await fs.writeFile(absPath, file.buffer);

    const relUrl = `/uploads/chat/${year}/${month}/${storedName}`;
    const saved = await this.attachmentRepository.save(
      this.attachmentRepository.create({
        uploadedById: userId,
        fileUrl: relUrl,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
      }),
    );
    return {
      id: saved.id,
      fileUrl: saved.fileUrl,
      fileName: saved.fileName,
      mimeType: saved.mimeType,
      fileSize: saved.fileSize,
    };
  }

  async listMessages(
    channelId: string,
    query: ListMessagesQueryDto,
  ): Promise<MessageListResponseDto> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId, isDeleted: false },
    });
    if (!channel) throw new AppException(ErrorCode.CHANNEL_NOT_FOUND);

    const limit = Math.min(
      MAX_MESSAGE_PAGE_SIZE,
      Math.max(1, query.limit ?? DEFAULT_MESSAGE_PAGE_SIZE),
    );

    const qb = this.messageRepository
      .createQueryBuilder("m")
      .leftJoinAndSelect("m.user", "user")
      .leftJoinAndSelect("m.attachments", "attachments")
      .where("m.channelId = :channelId", { channelId })
      .orderBy("m.createdAt", "DESC")
      .addOrderBy("m.id", "DESC")
      .take(limit + 1);

    if (query.before) {
      const cursor = await this.messageRepository.findOne({
        where: { id: query.before },
        select: { id: true, createdAt: true },
      });
      if (!cursor) throw new AppException(ErrorCode.CHAT_MESSAGE_NOT_FOUND);
      qb.andWhere("(m.createdAt, m.id) < (:cursorCreated, :cursorId)", {
        cursorCreated: cursor.createdAt,
        cursorId: cursor.id,
      });
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? page[page.length - 1].id : null;
    return {
      messages: page.map((m) => this.toMessageResponse(m)),
      nextCursor,
    };
  }

  async sendMessage(
    userId: string,
    dto: SendMessagePayloadDto,
  ): Promise<MessageResponseDto> {
    const channel = await this.channelRepository.findOne({
      where: { id: dto.channelId, isDeleted: false },
    });
    if (!channel) throw new AppException(ErrorCode.CHANNEL_NOT_FOUND);

    const attachmentIds = dto.attachmentIds ?? [];
    const sanitized = sanitizeContent(dto.content ?? "").trim();

    if (sanitized.length === 0 && attachmentIds.length === 0) {
      throw new AppException(ErrorCode.CHAT_MESSAGE_EMPTY);
    }
    if (attachmentIds.length > MAX_ATTACHMENTS_PER_MESSAGE) {
      throw new AppException(ErrorCode.ATTACHMENT_LIMIT_EXCEEDED);
    }

    const savedId = await this.dataSource.transaction(async (manager) => {
      const msg = await manager.save(ChatMessage, {
        channelId: dto.channelId,
        userId,
        content: sanitized,
      });
      if (attachmentIds.length > 0) {
        const attachments = await manager.find(ChatMessageAttachment, {
          where: {
            id: In(attachmentIds),
            uploadedById: userId,
            messageId: IsNull(),
          },
        });
        if (attachments.length !== attachmentIds.length) {
          throw new AppException(ErrorCode.ATTACHMENT_NOT_FOUND);
        }
        await manager.update(
          ChatMessageAttachment,
          { id: In(attachmentIds) },
          { messageId: msg.id },
        );
      }
      return msg.id;
    });

    const full = await this.messageRepository.findOne({
      where: { id: savedId },
      relations: { user: true, attachments: true },
    });
    if (!full) throw new AppException(ErrorCode.CHAT_MESSAGE_NOT_FOUND);
    this.logger.log(
      `Message ${full.id} sent by ${userId} in channel ${full.channelId}`,
    );
    return this.toMessageResponse(full);
  }

  async editMessage(
    userId: string,
    dto: EditMessagePayloadDto,
  ): Promise<MessageResponseDto> {
    const msg = await this.messageRepository.findOne({
      where: { id: dto.messageId, isDeleted: false },
      relations: { user: true, attachments: true },
    });
    if (!msg) throw new AppException(ErrorCode.CHAT_MESSAGE_NOT_FOUND);
    if (msg.userId !== userId) throw new AppException(ErrorCode.FORBIDDEN);

    const sanitized = sanitizeContent(dto.content).trim();
    if (sanitized.length === 0 && (msg.attachments?.length ?? 0) === 0) {
      throw new AppException(ErrorCode.CHAT_MESSAGE_EMPTY);
    }
    msg.content = sanitized;
    msg.editedAt = new Date();
    await this.messageRepository.save(msg);
    this.logger.log(`Message ${msg.id} edited by ${userId}`);
    return this.toMessageResponse(msg);
  }

  async deleteMessage(
    userId: string,
    dto: DeleteMessagePayloadDto,
  ): Promise<{ messageId: string; channelId: string }> {
    const msg = await this.messageRepository.findOne({
      where: { id: dto.messageId, isDeleted: false },
    });
    if (!msg) throw new AppException(ErrorCode.CHAT_MESSAGE_NOT_FOUND);
    if (msg.userId !== userId) throw new AppException(ErrorCode.FORBIDDEN);

    await this.messageRepository.update(msg.id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    this.logger.log(`Message ${msg.id} soft-deleted by ${userId}`);
    return { messageId: msg.id, channelId: msg.channelId };
  }

  private toChannelResponse(c: Channel): ChannelResponseDto {
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      languageId: c.languageId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  private toMessageResponse(m: ChatMessage): MessageResponseDto {
    return {
      id: m.id,
      channelId: m.channelId,
      user: {
        id: m.user.id,
        username: m.user.username,
        displayName: m.user.displayName,
        avatarUrl: m.user.avatarUrl,
      },
      content: m.isDeleted ? null : m.content,
      attachments: m.isDeleted
        ? []
        : (m.attachments ?? []).map(
            (a): AttachmentResponseDto => ({
              id: a.id,
              fileUrl: a.fileUrl,
              fileName: a.fileName,
              mimeType: a.mimeType,
              fileSize: a.fileSize,
            }),
          ),
      editedAt: m.editedAt,
      isDeleted: m.isDeleted,
      createdAt: m.createdAt,
    };
  }
}
