import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";
import { PostType } from "../entities/post.entity";

export class CreatePostDto {
  @ApiProperty({
    description: "Post type",
    enum: PostType,
  })
  @IsEnum(PostType, {
    message: "Type must be one of: question, discussion, resource, practice",
  })
  type: PostType;

  @ApiProperty({ description: "Post title (10-200 characters)" })
  @IsString({ message: "Title must be a string" })
  @IsNotEmpty({ message: "Title is required" })
  @MinLength(10, { message: "Title must be at least 10 characters long" })
  @MaxLength(200, { message: "Title must not exceed 200 characters" })
  title: string;

  @ApiProperty({ description: "Post content (minimum 20 characters)" })
  @IsString({ message: "Content must be a string" })
  @IsNotEmpty({ message: "Content is required" })
  @MinLength(20, { message: "Content must be at least 20 characters long" })
  content: string;

  @ApiProperty({
    description: "Array of 1-5 tag UUIDs",
    type: [String],
  })
  @IsArray({ message: "Tag IDs must be an array" })
  @ArrayMinSize(1, { message: "At least one tag is required" })
  @ArrayMaxSize(5, { message: "Maximum 5 tags allowed" })
  @IsUUID("4", { each: true, message: "Each tag ID must be a valid UUID" })
  tagIds: string[];
}

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: "Post type",
    enum: PostType,
  })
  @IsOptional()
  @IsEnum(PostType, {
    message: "Type must be one of: question, discussion, resource, practice",
  })
  type?: PostType;

  @ApiPropertyOptional({ description: "Post title (10-200 characters)" })
  @IsOptional()
  @IsString({ message: "Title must be a string" })
  @MinLength(10, { message: "Title must be at least 10 characters long" })
  @MaxLength(200, { message: "Title must not exceed 200 characters" })
  title?: string;

  @ApiPropertyOptional({
    description: "Post content (minimum 20 characters)",
  })
  @IsOptional()
  @IsString({ message: "Content must be a string" })
  @MinLength(20, { message: "Content must be at least 20 characters long" })
  content?: string;

  @ApiPropertyOptional({
    description: "Array of 1-5 tag UUIDs",
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: "Tag IDs must be an array" })
  @ArrayMinSize(1, { message: "At least one tag is required" })
  @ArrayMaxSize(5, { message: "Maximum 5 tags allowed" })
  @IsUUID("4", { each: true, message: "Each tag ID must be a valid UUID" })
  tagIds?: string[];
}

export class ListPostsQueryDto {
  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ description: "Filter by post type", enum: PostType })
  @IsOptional()
  @IsEnum(PostType, {
    message: "Type must be one of: question, discussion, resource, practice",
  })
  type?: PostType;

  @ApiPropertyOptional({ description: "Filter by post status" })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: "Comma-separated tag slugs",
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: "Filter by author UUID" })
  @IsOptional()
  @IsUUID("4", { message: "Author ID must be a valid UUID" })
  authorId?: string;

  @ApiPropertyOptional({ description: "Search in title and content" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Sort order: new, top, unanswered",
    default: "new",
  })
  @IsOptional()
  @IsString()
  sort?: string = "new";
}

export class PostAuthorDto {
  @ApiProperty() id: string;
  @ApiProperty() username: string;
  @ApiProperty() displayName: string;
  @ApiProperty({ nullable: true }) avatarUrl: string | null;
}

export class PostAuthorDetailDto extends PostAuthorDto {
  @ApiProperty() reputation: number;
  @ApiProperty() role: string;
}

export class PostTagDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty() color: string;
}

export class PostResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() type: string;
  @ApiProperty() status: string;
  @ApiProperty() title: string;
  @ApiProperty() content: string;
  @ApiProperty() author: PostAuthorDto;
  @ApiProperty({ type: [PostTagDto] }) tags: PostTagDto[];
  @ApiProperty() answerCount: number;
  @ApiProperty() viewCount: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PostDetailResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() type: string;
  @ApiProperty() status: string;
  @ApiProperty() title: string;
  @ApiProperty() content: string;
  @ApiProperty() author: PostAuthorDetailDto;
  @ApiProperty({ type: [PostTagDto] }) tags: PostTagDto[];
  @ApiProperty({ nullable: true }) acceptedAnswerId: string | null;
  @ApiProperty() answerCount: number;
  @ApiProperty() viewCount: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PaginationDto {
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() total: number;
  @ApiProperty() totalPages: number;
}

export class PostListResponseDto {
  @ApiProperty({ type: [PostResponseDto] }) posts: PostResponseDto[];
  @ApiProperty() pagination: PaginationDto;
}
