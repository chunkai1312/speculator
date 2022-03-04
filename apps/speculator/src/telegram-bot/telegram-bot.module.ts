import { Module } from '@nestjs/common';
import { TelegramBotUpdate } from './telegram-bot.update';
import { TickersModule } from '../tickers/tickers.module';

@Module({
  imports: [TickersModule],
  providers: [TelegramBotUpdate],
})
export class TelegramBotModule {}
