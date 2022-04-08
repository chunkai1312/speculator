import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EquityMarginsUpdatedEvent } from '../impl/equity-margins-updated.event';

@EventsHandler(EquityMarginsUpdatedEvent)
export class EquityMarginsUpdatedHandler implements IEventHandler<EquityMarginsUpdatedEvent> {
  async handle(event: EquityMarginsUpdatedEvent) {
    const { dto } = event;
    Logger.log(`${dto.exchange} - ${dto.date} 個股融資融券餘額已更新` )
  }
}
