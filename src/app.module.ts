import { ConfigModule } from '@nestjs/config';
export const configModule_ENV = ConfigModule.forRoot({
  envFilePath: ['.env.local', '.env'],
});
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { postgresConfig } from './settings/postgres.config';
import { MailModule } from './features/mail/mail.module';
import { MainModule } from './base/modules/main.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    configModule_ENV,
    TypeOrmModule.forRoot(postgresConfig),
    EventEmitterModule.forRoot(),
    CqrsModule,
    MainModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
