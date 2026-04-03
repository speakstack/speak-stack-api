// src/feed/dto/feed-response.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { PostResponseDto } from "../../post/dto/post.dto";

export class FeedResponseDto {
  @ApiProperty({ type: [PostResponseDto] })
  posts: PostResponseDto[];

  @ApiProperty({ description: "Cursor for next page, null if no more results", nullable: true })
  nextCursor: string | null;
}
