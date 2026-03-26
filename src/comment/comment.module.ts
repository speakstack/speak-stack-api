import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./entities/comment.entity";
import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";
import { AnswerModule } from "../answer/answer.module";
import { UserModule } from "../user/user.module";
import { ReputationModule } from "../reputation/reputation.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    AnswerModule,
    UserModule,
    ReputationModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
