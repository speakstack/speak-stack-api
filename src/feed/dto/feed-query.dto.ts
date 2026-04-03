// src/feed/dto/feed-query.dto.ts
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class FeedQueryDto {
  @ApiPropertyOptional({ description: "Cursor from previous response" })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: "Items per batch", default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Limit must be an integer" })
  @Min(1, { message: "Limit must be at least 1" })
  @Max(50, { message: "Limit must not exceed 50" })
  limit?: number = 20;
}
