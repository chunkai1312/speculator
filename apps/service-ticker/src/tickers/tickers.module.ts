import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TickersController } from './tickers.controller';
import { Ticker, TickerSchema } from './schemas/ticker.schema';
import { TickerRepository } from './repositories/ticker.repository';
import { CommandHandlers }  from './commands/handlers';
import { EventHandlers }  from './events/handlers';
import { QueryHandlers }  from './queries/handlers';

@Module({
  imports: [
    HttpModule,
    CqrsModule,
    MongooseModule.forFeature([
      { name: Ticker.name, schema: TickerSchema },
    ]),
  ],
  controllers: [
    TickersController,
  ],
  providers: [
    TickerRepository,
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
  exports: [
    TickerRepository,
  ],
})
export class TickersModule {}
