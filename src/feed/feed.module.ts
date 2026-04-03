// src/feed/feed.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "../post/entities/post.entity";
import { UserLanguage } from "../user-language/entities/user-language.entity";
import { PostVote } from "../vote/entities/post-vote.entity";
import { Answer } from "../answer/entities/answer.entity";
import { Comment } from "../comment/entities/comment.entity";
import { Tag } from "../tag/entities/tag.entity";
import { VoteModule } from "../vote/vote.module";
import { FeedController } from "./feed.controller";
import { FeedService } from "./feed.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, UserLanguage, PostVote, Answer, Comment, Tag]),
    VoteModule,
  ],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
