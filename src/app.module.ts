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
import { PostAttachment } from "./post/entities/post-attachment.entity";
import { Answer } from "./answer/entities/answer.entity";
import { ReputationHistory } from "./reputation/entities/reputation-history.entity";
import { TagModule } from "./tag/tag.module";
import { ReputationModule } from "./reputation/reputation.module";
import { PostModule } from "./post/post.module";
import { AnswerModule } from "./answer/answer.module";
import { Language } from "./language/entities/language.entity";
import { LanguageModule } from "./language/language.module";
import { UserLanguage } from "./user-language/entities/user-language.entity";
import { UserLanguageModule } from "./user-language/user-language.module";
import { GrammarModule } from "./grammar/grammar.module";
import { PostVote } from "./vote/entities/post-vote.entity";
import { AnswerVote } from "./vote/entities/answer-vote.entity";
import { VoteModule } from "./vote/vote.module";
import { EmailVerification } from "./auth/entities/email-verification.entity";
import { Comment } from "./comment/entities/comment.entity";
import { CommentModule } from "./comment/comment.module";
import { Level } from "./level/entities/level.entity";
import { LevelModule } from "./level/level.module";
import { Badge } from "./badge/entities/badge.entity";
import { UserBadge } from "./badge/entities/user-badge.entity";
import { BadgeModule } from "./badge/badge.module";
import { LeaderboardModule } from "./leaderboard/leaderboard.module";
import { FeedModule } from "./feed/feed.module";
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
        entities: [User, Tag, Post, PostAttachment, Answer, ReputationHistory, Language, UserLanguage, PostVote, AnswerVote, EmailVerification, Comment, Level, Badge, UserBadge],
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
    VoteModule,
    CommentModule,
    LanguageModule,
    UserLanguageModule,
    GrammarModule,
    LevelModule,
    BadgeModule,
    LeaderboardModule,
    FeedModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
