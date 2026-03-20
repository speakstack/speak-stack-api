import { Module } from "@nestjs/common";
import { VoteService } from "./vote.service";
import { PostVoteController } from "./controllers/post-vote.controller";
import { AnswerVoteController } from "./controllers/answer-vote.controller";

@Module({
  imports: [],
  controllers: [PostVoteController, AnswerVoteController],
  providers: [VoteService],
  exports: [VoteService],
})
export class VoteModule {}
