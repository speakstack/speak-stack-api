import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "./entities/post.entity";
import { PostController } from "./post.controller";
import { PostService } from "./post.service";
import { UserModule } from "../user/user.module";
import { TagModule } from "../tag/tag.module";
import { ReputationModule } from "../reputation/reputation.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    UserModule,
    TagModule,
    ReputationModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService, TypeOrmModule],
})
export class PostModule {}
