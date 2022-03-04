import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MarketChipsUpdatedEvent } from '../impl/market-chips-updated.event';

@EventsHandler(MarketChipsUpdatedEvent)
export class MarketChipsUpdatedHandler implements IEventHandler<MarketChipsUpdatedEvent> {
  async handle(event: MarketChipsUpdatedEvent) {
    const { dto } = event;
    Logger.log(`${dto.date} 大盤籌碼資料已更新` )
  }
}
