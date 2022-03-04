import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { SectorChipsUpdatedEvent } from '../impl/sector-chips-updated.event';

@EventsHandler(SectorChipsUpdatedEvent)
export class SectorChipsUpdatedHandler implements IEventHandler<SectorChipsUpdatedEvent> {
  async handle(event: SectorChipsUpdatedEvent) {
    const { date } = event;
    Logger.log(`${date} 類股資金流向資料已更新` )
  }
}
