import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EquitySharesUpdatedEvent } from '../impl/equity-shares-updated.event';

@EventsHandler(EquitySharesUpdatedEvent)
export class EquitySharesUpdatedHandler implements IEventHandler<EquitySharesUpdatedEvent> {
  async handle(event: EquitySharesUpdatedEvent) {
    const { dto } = event;
    Logger.log(`${dto.exchange} - ${dto.date} 個股外資持股資料已更新` )
  }
}
