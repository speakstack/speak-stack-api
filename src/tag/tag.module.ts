import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tag } from "./entities/tag.entity";
import { Post } from "../post/entities/post.entity";
import { Answer } from "../answer/entities/answer.entity";
import { TagController } from "./tag.controller";
import { TagService } from "./tag.service";
import { LanguageModule } from "../language/language.module";

@Module({
  imports: [TypeOrmModule.forFeature([Tag, Post, Answer]), LanguageModule],
  controllers: [TagController],
  providers: [TagService],
  exports: [TypeOrmModule],
})
export class TagModule {}
