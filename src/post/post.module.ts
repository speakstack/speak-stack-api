import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "./entities/post.entity";
import { PostAttachment } from "./entities/post-attachment.entity";
import { Answer } from "../answer/entities/answer.entity";
import { Language } from "../language/entities/language.entity";
import { PostController } from "./post.controller";
import { PostService } from "./post.service";
import { UserModule } from "../user/user.module";
import { TagModule } from "../tag/tag.module";
import { LanguageModule } from "../language/language.module";
import { ReputationModule } from "../reputation/reputation.module";
import { VoteModule } from "../vote/vote.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostAttachment, Answer, Language]),
    UserModule,
    TagModule,
    LanguageModule,
    ReputationModule,
    VoteModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService, TypeOrmModule],
})
export class PostModule {}
