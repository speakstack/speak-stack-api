import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AtStrategy } from "./strategies";
import { UserModule } from "../user/user.module";

/**
 * Authentication module providing JWT-based authentication
 * with access token strategy and refresh token rotation.
 */
@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
