import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransformInterceptor } from './transform.interceptor';
import { configDotenv } from 'dotenv';
import { CommonModule } from './common/common.module';
import { ChatModule } from './chat/chat.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { throttleConfig } from './common/config/throttle.config';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './common/config/logger.config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RagModule } from './rag/rag.module';
import { ChatSession } from './chat/entities/chat.entity';
import { ChatMessage } from './chat/entities/chat-message.entity';
import { CustomThrottlerGuard } from './common/guards/throttle.guard';

configDotenv();
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'chatbot',
      entities: [ ChatSession, ChatMessage],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    WinstonModule.forRoot(loggerConfig),
    ThrottlerModule.forRoot(throttleConfig),
    CommonModule,
    ChatModule,
    RagModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}