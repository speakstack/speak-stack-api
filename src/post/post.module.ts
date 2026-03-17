import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "./entities/post.entity";
import { Answer } from "../answer/entities/answer.entity";
import { Language } from "../language/entities/language.entity";
import { PostController } from "./post.controller";
import { PostService } from "./post.service";
import { UserModule } from "../user/user.module";
import { TagModule } from "../tag/tag.module";
import { LanguageModule } from "../language/language.module";
import { ReputationModule } from "../reputation/reputation.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Answer, Language]),
    UserModule,
    TagModule,
    LanguageModule,
    ReputationModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService, TypeOrmModule],
})
export class PostModule {}
