import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserLanguage } from "./entities/user-language.entity";
import { UserLanguageController } from "./user-language.controller";
import { UserLanguagesController } from "./user-languages.controller";
import { UserLanguageService } from "./user-language.service";
import { LanguageModule } from "../language/language.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserLanguage]),
    LanguageModule,
    UserModule,
  ],
  controllers: [UserLanguageController, UserLanguagesController],
  providers: [UserLanguageService],
})
export class UserLanguageModule {}
