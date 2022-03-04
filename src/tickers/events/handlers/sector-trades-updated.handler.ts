import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SectorTradesUpdatedEvent } from '../impl/sector-trades-updated.event';

@EventsHandler(SectorTradesUpdatedEvent)
export class SectorTradesUpdatedHandler implements IEventHandler<SectorTradesUpdatedEvent> {
  async handle(event: SectorTradesUpdatedEvent) {
    const { dto } = event;
    Logger.log(`${dto.date} ${dto.exchange} 類股成交量值已更新` )
  }
}
