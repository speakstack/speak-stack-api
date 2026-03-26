import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./entities/comment.entity";
import { Answer } from "../answer/entities/answer.entity";
import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Answer]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
