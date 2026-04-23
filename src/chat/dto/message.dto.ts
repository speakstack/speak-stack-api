import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { AttachmentResponseDto } from "./attachment.dto";

export class ListMessagesQueryDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  before?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class MessageAuthorDto {
  @ApiProperty({ format: "uuid" }) id: string;
  @ApiProperty() username: string;
  @ApiProperty({ nullable: true }) displayName: string | null;
  @ApiProperty({ nullable: true }) avatarUrl: string | null;
}

export class MessageResponseDto {
  @ApiProperty({ format: "uuid" }) id: string;
  @ApiProperty({ format: "uuid" }) channelId: string;
  @ApiProperty({ type: MessageAuthorDto }) user: MessageAuthorDto;
  @ApiProperty({ nullable: true }) content: string | null;
  @ApiProperty({ type: [AttachmentResponseDto] })
  attachments: AttachmentResponseDto[];
  @ApiProperty({ nullable: true, type: String, format: "date-time" })
  editedAt: Date | null;
  @ApiProperty() isDeleted: boolean;
  @ApiProperty() createdAt: Date;
}

export class MessageListResponseDto {
  @ApiProperty({ type: [MessageResponseDto] }) messages: MessageResponseDto[];
  @ApiProperty({ nullable: true, format: "uuid" })
  nextCursor: string | null;
}

export class SendMessagePayloadDto {
  @IsUUID()
  channelId: string;

  @IsString()
  @MaxLength(4000)
  content: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsUUID("4", { each: true })
  attachmentIds?: string[];
}

export class EditMessagePayloadDto {
  @IsUUID()
  messageId: string;

  @IsString()
  @MaxLength(4000)
  content: string;
}

export class DeleteMessagePayloadDto {
  @IsUUID()
  messageId: string;
}

export class ChannelRoomPayloadDto {
  @IsUUID()
  channelId: string;
}
