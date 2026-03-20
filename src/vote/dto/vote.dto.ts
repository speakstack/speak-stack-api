import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt } from "class-validator";

export class VoteDto {
  @ApiProperty({
    description: "Vote value: 1 (upvote), -1 (downvote), 0 (unvote)",
    enum: [1, -1, 0],
    example: 1,
  })
  @IsInt({ message: "Vote value must be an integer" })
  @IsIn([1, -1, 0], { message: "Vote value must be 1, -1, or 0" })
  value: number;
}

export class VoteResponseDto {
  @ApiProperty({ description: "Total upvote count" })
  upvoteCount: number;

  @ApiProperty({ description: "Total downvote count" })
  downvoteCount: number;

  @ApiProperty({ description: "Score (upvotes - downvotes)" })
  score: number;

  @ApiProperty({
    description: "Current user vote: 1, -1, or 0",
    enum: [1, -1, 0],
  })
  userVote: number;
}
