import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MarketTradesUpdatedEvent } from '../impl/market-trades-updated.event';

@EventsHandler(MarketTradesUpdatedEvent)
export class MarketTradesUpdatedHandler implements IEventHandler<MarketTradesUpdatedEvent> {
  async handle(event: MarketTradesUpdatedEvent) {
    const { dto } = event;
    Logger.log(`${dto.date} ${dto.exchange} 大盤成交量值已更新` )
  }
}
