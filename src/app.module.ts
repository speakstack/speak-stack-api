import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { AtGuard } from "./auth/guards/at.guard";
import { HealthModule } from "./health/health.module";
import { UserModule } from "./user/user.module";
import { User } from "./user/entities/user.entity";
import { Tag } from "./tag/entities/tag.entity";
import { Post } from "./post/entities/post.entity";
import { Answer } from "./answer/entities/answer.entity";
import { ReputationHistory } from "./reputation/entities/reputation-history.entity";
import { TagModule } from "./tag/tag.module";
import { ReputationModule } from "./reputation/reputation.module";
import { PostModule } from "./post/post.module";
import { AnswerModule } from "./answer/answer.module";
import databaseConfig from "./config/database.config";
import { SnakeNamingStrategy } from "./config/snake-naming.strategy";

/**
 * Root application module.
 * Registers global guard for JWT authentication (secure by default).
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("database.host"),
        port: configService.get<number>("database.port"),
        username: configService.get<string>("database.username"),
        password: configService.get<string>("database.password"),
        database: configService.get<string>("database.database"),
        entities: [User, Tag, Post, Answer, ReputationHistory],
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: Bun.env.NODE_ENV !== "production",
        logging: Bun.env.NODE_ENV === "development",
      }),
    }),
    UserModule,
    AuthModule,
    HealthModule,
    TagModule,
    ReputationModule,
    PostModule,
    AnswerModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
