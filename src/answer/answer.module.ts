import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Answer } from "./entities/answer.entity";
import { AnswerController } from "./answer.controller";
import { PostAnswersController } from "./controllers/post-answers.controller";
import { AnswerService } from "./answer.service";
import { PostModule } from "../post/post.module";
import { UserModule } from "../user/user.module";
import { ReputationModule } from "../reputation/reputation.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Answer]),
    PostModule,
    UserModule,
    ReputationModule,
  ],
  controllers: [PostAnswersController, AnswerController],
  providers: [AnswerService],
})
export class AnswerModule {}
