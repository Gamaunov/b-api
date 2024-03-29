import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Repository } from 'typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { QuestionCreateUseCase } from '../../features/quiz/applications/usecases/question-create.usecase';
import { QuestionsRepository } from '../../features/quiz/infrastructure/questions.repository';
import { QuestionsQueryRepository } from '../../features/quiz/infrastructure/questions.query.repository';
import { GameRepository } from '../../features/quiz/infrastructure/game.repository';
import { GameQueryRepository } from '../../features/quiz/infrastructure/game.query.repository';
import { QuizQuestion } from '../../features/quiz/domain/quiz-question.entity';
import { QuizAnswer } from '../../features/quiz/domain/quiz-answer.entity';
import { QuizGame } from '../../features/quiz/domain/quiz-game.entity';
import { QuizPlayer } from '../../features/quiz/domain/quiz-player';
import { QuizController } from '../../features/quiz/api/quiz.controller';
import { SAQuizController } from '../../features/quiz/api/sa-quiz.controller';
import { TestingController } from '../../testing/testing.controller';
import { RegistrationUseCase } from '../../features/auth/api/public/application/usecases/registration/registration.usecase';
import { RegistrationEmailResendUseCase } from '../../features/auth/api/public/application/usecases/registration/registration-email-resend.usecase';
import { RegistrationConfirmationUseCase } from '../../features/auth/api/public/application/usecases/registration/registration-confirmation.usecase';
import { PasswordRecoveryUseCase } from '../../features/auth/api/public/application/usecases/password/password-recovery.usecase';
import { PasswordUpdateUseCase } from '../../features/auth/api/public/application/usecases/password/password-update.usecase';
import { ValidateRefreshTokenUseCase } from '../../features/auth/api/public/application/usecases/validations/validate-refresh-token.usecase';
import { TokensCreateUseCase } from '../../features/auth/api/public/application/usecases/tokens/tokens-create.usecase';
import { JwtRefreshTokenStrategy } from '../../features/auth/strategies/jwt-refresh.strategy';
import { AuthController } from '../../features/auth/api/public/auth.controller';
import { DeviceAuthSessions } from '../../features/devices/domain/device.entity';
import { User } from '../../features/users/domain/user.entity';
import { BasicStrategy } from '../../features/auth/strategies/basic.strategy';
import { JwtBearerStrategy } from '../../features/auth/strategies/jwt-bearer.strategy';
import { LocalStrategy } from '../../features/auth/strategies/local.strategy';
import { IsDeviceExist } from '../../infrastructure/middlewares/is-device-exist.middleware';
import { DevicesQueryRepository } from '../../features/devices/infrastructure/devices.query.repository';
import { DevicesController } from '../../features/devices/api/devices.controller';
import { SAUsersController } from '../../features/users/api/sa-users.controller';
import { AuthService } from '../../features/auth/api/public/application/auth.service';
import { UserCreateUseCase } from '../../features/users/application/usecases/create-user.usecase';
import { UserDeleteUseCase } from '../../features/users/application/usecases/delete-user.usecase';
import { LoginDeviceUseCase } from '../../features/devices/application/usecases/login-device.usecase';
import { TerminateOtherSessionsUseCase } from '../../features/devices/application/usecases/terminate-other-sessions.usecase';
import { TerminateSessionUseCase } from '../../features/devices/application/usecases/terminate-session.usecase';
import { UpdateTokensUseCase } from '../../features/devices/application/usecases/update-tokens.usecase';
import { LoginAndPasswordValidationUseCase } from '../../features/auth/api/public/application/usecases/validations/login-password-validation.usecase';
import { UsersRepository } from '../../features/users/infrastructure/users.repository';
import { DevicesRepository } from '../../features/devices/infrastructure/devices.repository';
import { UsersQueryRepository } from '../../features/users/infrastructure/users.query.repository';
import { IsEmailAlreadyExistConstraint } from '../../infrastructure/decorators/unique-email.decorator';
import { IsLoginAlreadyExistConstraint } from '../../infrastructure/decorators/unique-login.decorator';
import { TerminateSessionLogoutUseCase } from '../../features/auth/api/public/application/usecases/tokens/terminate-session-logout.usecase';
import { BlogCreateUseCase } from '../../features/blogs/application/usecases/create-blog.usecase';
import { BlogsRepository } from '../../features/blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../../features/blogs/infrastructure/blogs.query.repository';
import { SABlogsController } from '../../features/blogs/api/sa-blogs.controller';
import { BlogUpdateUseCase } from '../../features/blogs/application/usecases/update-blog.usecase';
import { BlogDeleteUseCase } from '../../features/blogs/application/usecases/delete-blog.usecase';
import { PostsQueryRepository } from '../../features/posts/infrastructure/posts.query.repository';
import { PostsRepository } from '../../features/posts/infrastructure/posts.repository';
import { PostsController } from '../../features/posts/api/posts.controller';
import { PostCreatePostForSpecificBlogUseCase } from '../../features/posts/application/usecases/create-post-for-specific-blog.usecase';
import { PostUpdatePostForSpecificBlogUseCase } from '../../features/posts/application/usecases/update-post-for-specific-blog.usecase';
import { PostDeleteUseCase } from '../../features/posts/application/usecases/delete-post.usecase';
import { BlogsController } from '../../features/blogs/api/blogs.controller';
import { PostCreateCommentUseCase } from '../../features/posts/application/usecases/create-comment-for-post.usecase';
import { CommentsQueryRepository } from '../../features/comments/infrastructure/comments.query.repository';
import { CommentsRepository } from '../../features/comments/infrastructure/comments.repository';
import { CommentsController } from '../../features/comments/api/comments.controller';
import { CommentUpdateUseCase } from '../../features/comments/application/usecases/update-comment.usecase';
import { CommentDeleteUseCase } from '../../features/comments/application/usecases/delete-comment.usecase';
import { PostLikeOperationUseCase } from '../../features/posts/application/usecases/post-like-operation.usecase';
import { CommentLikeOperationUseCase } from '../../features/comments/application/usecases/comment-like-operation.usecase';
import { TokenParserMiddleware } from '../../infrastructure/middlewares/token-parser.middleware';
import { Post } from '../../features/posts/domain/post.entity';
import { Blog } from '../../features/blogs/domain/blog.entity';
import { Comment } from '../../features/comments/domain/comment.entity';
import { CommentLike } from '../../features/comments/domain/comment-like.entity';
import { PostLike } from '../../features/posts/domain/post-like.entity';
import { UserEmailConfirmation } from '../../features/users/domain/user-email-confirmation.entity';
import { UserPasswordRecovery } from '../../features/users/domain/user-password-recovery.entity';
import { QuestionUpdateUseCase } from '../../features/quiz/applications/usecases/question-update.usecase';
import { QuestionDeleteUseCase } from '../../features/quiz/applications/usecases/question-delete.usecase';
import { QuestionPublishUseCase } from '../../features/quiz/applications/usecases/question-publish.usecase';
import { QuizConnectUserUseCase } from '../../features/quiz/applications/usecases/connect-user.usecase';
import { TransactionsRepository } from '../infrastructure/transactions.repository';
import { QuizSendAnswerUseCase } from '../../features/quiz/applications/usecases/send-answer.usecase';
import { GameFindUseCase } from '../../features/quiz/applications/usecases/find-game.usecase';
import { CurrentGameFindUseCase } from '../../features/quiz/applications/usecases/find-current-game.usecase';
import { GameFinishedListener } from '../../features/quiz/event-emitter/listeners/game-finished.listener';
import { BlogBindWithUserUseCase } from '../../features/blogs/application/usecases/bind-blog-with-user.usecase';
import { BloggerBlogsController } from '../../features/blogs/api/blogger-blogs.controller';
import { UserBanUseCase } from '../../features/users/application/usecases/ban-user.usecase';
import { BloggerUsersController } from '../../features/users/api/blogger-users.controller';
import { UserBanByBloggerUseCase } from '../../features/users/application/usecases/ban-user-by-blogger.usecase';
import { BloggerGetBannedUsersUseCase } from '../../features/users/application/usecases/blogger-get-banned-users.usecase';
import { BlogBanUseCase } from '../../features/blogs/application/usecases/blog-ban.usecase';
import { BlogAddMainImageUseCase } from '../../features/blogs/application/usecases/blog-add-main-image.usecase';
import { S3Adapter } from '../application/adapters/s3.adapter';
import { TransactionHelper } from '../transactions/transaction.helper';
import { BlogAddWallpaperImageUseCase } from '../../features/blogs/application/usecases/blog-add-wallpaper-image.usecase';
import { PostAddMainImageUseCase } from '../../features/blogs/application/usecases/post-add-main-image.usecase';
import { IntegrationTelegramController } from '../../features/integrations/telegram/api/integration.telegram.controller';
import { TgBotGetAuthLinkQueryUseCase } from '../../features/integrations/telegram/application/usecases/tg-bot-get-auth-link-query.usecase';
import { TgBlogSubscribersRepository } from '../../features/integrations/telegram/infrastructure/tg.blog.subscribers.repository';
import { TgBlogSubscribersQueryRepository } from '../../features/integrations/telegram/infrastructure/tg.blog.subscribers.query.repository';
import { TgBlogSubscriber } from '../../features/integrations/telegram/domain/tg.blog.subscriber.entity';
import { TelegramAdapter } from '../../features/integrations/telegram/adapters/telegram.adapter';
import { TgAddToNotificationsWhitelistUseCase } from '../../features/integrations/telegram/application/usecases/tg-add-to-notifications.usecase';
import { BlogSubscribeUseCase } from '../../features/blogs/application/usecases/blog-subscribe.usecase';
import { BlogUnsubscribeUseCase } from '../../features/blogs/application/usecases/blog-unsubscribe.usecase';
import { DataSourceRepository } from '../infrastructure/data-source.repository';

const controllers = [
  SAUsersController,
  SABlogsController,
  BlogsController,
  PostsController,
  DevicesController,
  AuthController,
  TestingController,
  CommentsController,
  SAQuizController,
  QuizController,
  BloggerBlogsController,
  BloggerUsersController,
  IntegrationTelegramController,
];

const services = [JwtService, AuthService];

const entities = [
  DeviceAuthSessions,
  User,
  Post,
  Blog,
  Comment,
  CommentLike,
  PostLike,
  UserEmailConfirmation,
  UserPasswordRecovery,
  QuizAnswer,
  QuizGame,
  QuizPlayer,
  QuizQuestion,
  TgBlogSubscriber,
];

const typeORMRepositories = [
  Repository<User>,
  Repository<DeviceAuthSessions>,
  Repository<Post>,
];

const useCases = [
  UserCreateUseCase,
  UserDeleteUseCase,
  LoginDeviceUseCase,
  TerminateOtherSessionsUseCase,
  TerminateSessionUseCase,
  TerminateSessionLogoutUseCase,
  UpdateTokensUseCase,
  RegistrationUseCase,
  RegistrationEmailResendUseCase,
  RegistrationConfirmationUseCase,
  PasswordRecoveryUseCase,
  PasswordUpdateUseCase,
  ValidateRefreshTokenUseCase,
  TokensCreateUseCase,
  LoginAndPasswordValidationUseCase,
  BlogCreateUseCase,
  BlogUpdateUseCase,
  BlogDeleteUseCase,
  PostCreatePostForSpecificBlogUseCase,
  PostUpdatePostForSpecificBlogUseCase,
  PostDeleteUseCase,
  PostCreateCommentUseCase,
  CommentUpdateUseCase,
  CommentDeleteUseCase,
  PostLikeOperationUseCase,
  CommentLikeOperationUseCase,
  QuestionCreateUseCase,
  QuestionUpdateUseCase,
  QuestionDeleteUseCase,
  QuestionPublishUseCase,
  QuizConnectUserUseCase,
  QuizSendAnswerUseCase,
  GameFindUseCase,
  CurrentGameFindUseCase,
  BlogBindWithUserUseCase,
  UserBanUseCase,
  UserBanByBloggerUseCase,
  BloggerGetBannedUsersUseCase,
  BlogBanUseCase,
  BlogAddMainImageUseCase,
  BlogAddWallpaperImageUseCase,
  PostAddMainImageUseCase,
  TgBotGetAuthLinkQueryUseCase,
  TgAddToNotificationsWhitelistUseCase,
  BlogSubscribeUseCase,
  BlogUnsubscribeUseCase,
];

const repositories = [
  UsersRepository,
  DevicesRepository,
  BlogsRepository,
  PostsRepository,
  CommentsRepository,
  QuestionsRepository,
  GameRepository,
  TransactionsRepository,
  TgBlogSubscribersRepository,
  DataSourceRepository,
];

const queryRepositories = [
  UsersQueryRepository,
  DevicesQueryRepository,
  BlogsQueryRepository,
  PostsQueryRepository,
  CommentsQueryRepository,
  QuestionsQueryRepository,
  GameQueryRepository,
  TgBlogSubscribersQueryRepository,
];

const constraints = [
  IsEmailAlreadyExistConstraint,
  IsLoginAlreadyExistConstraint,
];

const adapters = [S3Adapter, TelegramAdapter];
const helpers = [TransactionHelper];

const strategies = [
  BasicStrategy,
  JwtBearerStrategy,
  JwtRefreshTokenStrategy,
  LocalStrategy,
];

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    TypeOrmModule.forFeature([...entities]),
    CqrsModule,
    PassportModule,
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [...controllers],
  providers: [
    ...services,
    ...useCases,
    ...repositories,
    ...strategies,
    ...queryRepositories,
    ...typeORMRepositories,
    ...constraints,
    ...adapters,
    ...helpers,
    GameFinishedListener,
    ConfigService,
  ],
})
export class MainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IsDeviceExist).forRoutes({
      path: 'security/devices/:id',
      method: RequestMethod.DELETE,
    });
    consumer
      .apply(TokenParserMiddleware)
      .forRoutes(
        { path: 'posts', method: RequestMethod.GET },
        { path: 'posts/:id', method: RequestMethod.GET },
        { path: 'blogs/:id/posts', method: RequestMethod.GET },
        { path: 'posts/:id/comments', method: RequestMethod.GET },
        { path: 'comments/:id', method: RequestMethod.GET },
        { path: 'blogs/:id', method: RequestMethod.GET },
        { path: 'blogs', method: RequestMethod.GET },
        { path: 'blogs/:id/subscription', method: RequestMethod.DELETE },
      );
  }
}
