import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

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

export class ListAnswersQueryDto {
  @ApiPropertyOptional({
    description: "Sort order: votes (default) or new",
    default: "votes",
  })
  @IsOptional()
  @IsString()
  sort?: string = "votes";
}

export class AnswerAuthorDto {
  @ApiProperty() id: string;
  @ApiProperty() username: string;
  @ApiProperty() displayName: string;
  @ApiProperty({ nullable: true }) avatarUrl: string | null;
}

export class AnswerResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() content: string;
  @ApiProperty() author: AnswerAuthorDto;
  @ApiProperty() isAccepted: boolean;
  @ApiProperty() score: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
