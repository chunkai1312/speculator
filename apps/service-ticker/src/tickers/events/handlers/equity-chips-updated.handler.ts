import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EquityChipsUpdatedEvent } from '../impl/equity-chips-updated.event';

@EventsHandler(EquityChipsUpdatedEvent)
export class EquityChipsUpdatedHandler implements IEventHandler<EquityChipsUpdatedEvent> {
  async handle(event: EquityChipsUpdatedEvent) {
    const { dto } = event;
    Logger.log(`${dto.exchange} - ${dto.date} 個股買賣超資料已更新`)
  }
}
