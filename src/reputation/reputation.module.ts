import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReputationHistory } from "./entities/reputation-history.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ReputationHistory])],
  exports: [TypeOrmModule],
})
export class ReputationModule {}
