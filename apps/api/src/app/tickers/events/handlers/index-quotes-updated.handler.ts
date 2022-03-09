import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IndexQuotesUpdatedEvent } from '../impl/index-quotes-updated.event';

@EventsHandler(IndexQuotesUpdatedEvent)
export class IndexQuotesUpdatedHandler implements IEventHandler<IndexQuotesUpdatedEvent> {
  async handle(event: IndexQuotesUpdatedEvent) {
    const { dto } = event;
    Logger.log(`${dto.exchange} - ${dto.date} 指數每日行情資料已更新` )
  }
}
