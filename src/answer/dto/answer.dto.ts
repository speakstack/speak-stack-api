import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";
import { PaginationDto } from "../../common/dto/pagination.dto";

export class CreateAnswerDto {
  @ApiProperty({ description: "Answer content (minimum 10 characters)" })
  @IsString({ message: "Content must be a string" })
  @IsNotEmpty({ message: "Content is required" })
  @MinLength(10, { message: "Content must be at least 10 characters long" })
  content: string;
}

export class UpdateAnswerDto {
  @ApiProperty({ description: "Answer content (minimum 10 characters)" })
  @IsString({ message: "Content must be a string" })
  @IsNotEmpty({ message: "Content is required" })
  @MinLength(10, { message: "Content must be at least 10 characters long" })
  content: string;
}

export enum AnswerSort {
  VOTES = "votes",
  NEW = "new",
}

export class ListAnswersQueryDto {
  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Items per page", default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "Sort order: votes (default) or new",
    default: AnswerSort.VOTES,
    enum: AnswerSort,
  })
  @IsOptional()
  @IsEnum(AnswerSort, {
    message: "Sort must be one of: votes, new",
  })
  sort?: AnswerSort = AnswerSort.VOTES;
}

export class AnswerAuthorDto {
  @ApiProperty() id: string;
  @ApiProperty() username: string;
  @ApiProperty({ nullable: true }) displayName: string | null;
  @ApiProperty({ nullable: true }) avatarUrl: string | null;
}

export class AnswerResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() content: string;
  @ApiProperty() author: AnswerAuthorDto;
  @ApiProperty() isAccepted: boolean;
  @ApiProperty() score: number;
  @ApiProperty({
    description: "Current user vote: 1 (upvoted), -1 (downvoted), 0 (no vote)",
    enum: [1, -1, 0],
    default: 0,
  })
  userVote: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class AnswerListResponseDto {
  @ApiProperty({ type: [AnswerResponseDto] }) answers: AnswerResponseDto[];
  @ApiProperty() pagination: PaginationDto;
}
