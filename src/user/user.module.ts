import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserLanguage } from "../user-language/entities/user-language.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { BadgeModule } from "../badge/badge.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, UserLanguage]), BadgeModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [TypeOrmModule],
})
export class UserModule {}
