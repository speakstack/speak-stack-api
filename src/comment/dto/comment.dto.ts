import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";
import { PaginationDto } from "../../common/dto/pagination.dto";

export class CreateCommentDto {
  @ApiProperty({ description: "Comment content (1-1000 characters)" })
  @IsString({ message: "Content must be a string" })
  @IsNotEmpty({ message: "Content is required" })
  @MinLength(1, { message: "Content must be at least 1 character long" })
  @MaxLength(1000, { message: "Content must be at most 1000 characters long" })
  content: string;
}

export class UpdateCommentDto {
  @ApiProperty({ description: "Comment content (1-1000 characters)" })
  @IsString({ message: "Content must be a string" })
  @IsNotEmpty({ message: "Content is required" })
  @MinLength(1, { message: "Content must be at least 1 character long" })
  @MaxLength(1000, { message: "Content must be at most 1000 characters long" })
  content: string;
}

export class ListCommentsQueryDto {
  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

export class CommentAuthorDto {
  @ApiProperty() id: string;
  @ApiProperty() username: string;
  @ApiProperty({ nullable: true }) displayName: string | null;
  @ApiProperty({ nullable: true }) avatarUrl: string | null;
}

export class CommentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() content: string;
  @ApiProperty() author: CommentAuthorDto;
  @ApiProperty({ nullable: true }) editedAt: Date | null;
  @ApiProperty() isDeleted: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class CommentListResponseDto {
  @ApiProperty({ type: [CommentResponseDto] }) comments: CommentResponseDto[];
  @ApiProperty() pagination: PaginationDto;
}
