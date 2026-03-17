import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tag } from "./entities/tag.entity";
import { TagController } from "./tag.controller";
import { TagService } from "./tag.service";
import { LanguageModule } from "../language/language.module";

@Module({
  imports: [TypeOrmModule.forFeature([Tag]), LanguageModule],
  controllers: [TagController],
  providers: [TagService],
  exports: [TypeOrmModule],
})
export class TagModule {}
