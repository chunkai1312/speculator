import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EquityQuotesUpdatedEvent } from '../impl/equity-quotes-updated.event';

@EventsHandler(EquityQuotesUpdatedEvent)
export class EquityQuotesUpdatedHandler implements IEventHandler<EquityQuotesUpdatedEvent> {
  async handle(event: EquityQuotesUpdatedEvent) {
    const { dto } = event;
    Logger.log(`${dto.exchange} - ${dto.date} 個股每日行情資料已更新` )
  }
}
