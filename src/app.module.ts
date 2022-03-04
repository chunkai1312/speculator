import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { ConsoleModule } from 'nestjs-console';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { TasksModule } from './tasks/tasks.module';
import { TickersModule } from './tickers/tickers.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommandsModule } from './commands/commands.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN,
      include: [TelegramBotModule],
    }),
    TelegramBotModule,
    TasksModule,
    TickersModule,
    CommandsModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
