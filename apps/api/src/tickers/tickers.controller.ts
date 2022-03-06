import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateMarketChipsCommand } from './commands/impl/update-market-chips.command';
import { UpdateEquityChipsCommand } from './commands/impl/update-equity-chips.command';
import { UpdateEquityQuotesCommand } from './commands/impl/update-equity-quotes.command';
import { UpdateIndexQuotesCommand } from './commands/impl/update-index-quotes.command';
import { UpdateMarketTradesCommand } from './commands/impl/update-market-trades.command';
import { UpdateSectorTradesCommand } from './commands/impl/update-sector-trades.command';
import { GetMarketInfoQuery } from './queries/impl/get-market-info.query';
import { GetSectorInfoQuery } from './queries/impl/get-sector-info.query';
import { GetTickersByDateQuery } from './queries/impl/get-tickers-by-date.query';
import { GetLastTradeDatesByDateQuery } from './queries/impl/get-last-trade-dates-by-date.query';
import { UpdateMarketChipsDto } from './dto/update-market-chips.dto';
import { UpdateEquityChipsDto } from './dto/update-equity-chips.dto';
import { UpdateEquityQuotesDto } from './dto/update-equity-quotes.dto';
import { UpdateIndexQuotesDto } from './dto/update-index-quotes.dto';
import { UpdateMarketTradesDto } from './dto/update-market-trades.dto';
import { UpdateSectorTradesDto } from './dto/update-sector-trades.dto';
import { GetTickersFilterDto } from './dto/get-tickers-filter.dto';
import { GetMarketInfoFilter } from './dto/get-market-info-filter.dto';
import { GetSectorInfoFilter } from './dto/get-sector-info-filter.dto';
import { GetLastTradeDatesByDateFilterDto } from './dto/get-last-trade-dates-by-date-filter.dto';
import * as constants from './constants';

@Controller()
export class TickersController {
  private readonly logger = new Logger(TickersController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
  }

  @MessagePattern({ cmd: constants.UPDATE_MARKET_CHIPS })
  async updateMarketChips(updateMarketChipsDto: UpdateMarketChipsDto) {
    return this.commandBus
      .execute(new UpdateMarketChipsCommand(updateMarketChipsDto))
      .catch(err => this.logger.error(err.message, err.stack));
  }

  @MessagePattern({ cmd: constants.UPDATE_EQUITY_CHIPS })
  async updateEquityChips(updateEquityChipsDto: UpdateEquityChipsDto) {
    return this.commandBus
      .execute(new UpdateEquityChipsCommand(updateEquityChipsDto))
      .catch(err => this.logger.error(err.message, err.stack));
  }

  @MessagePattern({ cmd: constants.UPDATE_EQUITY_QUOTES })
  async updateEquityQuotes(updateEquityQuotesDto: UpdateEquityQuotesDto) {
    return this.commandBus
      .execute(new UpdateEquityQuotesCommand(updateEquityQuotesDto))
      .catch(err => this.logger.error(err.message, err.stack));
  }

  @MessagePattern({ cmd: constants.UPDATE_INDEX_QUOTES })
  async updateIndexQuotes(updateIndexQuotesDto: UpdateIndexQuotesDto) {
    return this.commandBus
      .execute(new UpdateIndexQuotesCommand(updateIndexQuotesDto))
      .catch(err => this.logger.error(err.message, err.stack));
  }

  @MessagePattern({ cmd: constants.UPDATE_MARKET_TRADES })
  async updateMarketTrades(updateMarketTradesDto: UpdateMarketTradesDto) {
    return this.commandBus
      .execute(new UpdateMarketTradesCommand(updateMarketTradesDto))
      .catch(err => this.logger.error(err.message, err.stack));
  }

  @MessagePattern({ cmd: constants.UPDATE_SECTOR_TRADES })
  async updateSectorTrades(updateSectorTradesDto: UpdateSectorTradesDto) {
    return this.commandBus
      .execute(new UpdateSectorTradesCommand(updateSectorTradesDto))
      .catch(err => this.logger.error(err.message, err.stack));
  }

  @MessagePattern({ cmd: constants.GET_TICKERS_BY_DATE })
  async getTickersByDate(getTickersFilterDto: GetTickersFilterDto) {
    return this.queryBus
      .execute(new GetTickersByDateQuery(getTickersFilterDto))
      .catch(err => this.logger.error(err.message, err.stack));
  }

  @MessagePattern({ cmd: constants.GET_MARKET_INFO })
  async getMarketInfo(getMarketInfoFilter: GetMarketInfoFilter) {
    return this.queryBus
      .execute(new GetMarketInfoQuery(getMarketInfoFilter))
      .catch(err => this.logger.error(err.message, err.stack));
  }

  @MessagePattern({ cmd: constants.GET_SECTOR_INFO })
  async getSectorInfo(getSectorInfoFilter: GetSectorInfoFilter) {
    return this.queryBus
      .execute(new GetSectorInfoQuery(getSectorInfoFilter))
      .catch(err => this.logger.error(err.message, err.stack));
  }

  @MessagePattern({ cmd: constants.GET_LAST_TRADE_DATES_BY_DATE })
  async getLastTradeDatesByDate(filterDto: GetLastTradeDatesByDateFilterDto) {
    return this.queryBus
      .execute(new GetLastTradeDatesByDateQuery(filterDto))
      .catch(err => this.logger.error(err.message, err.stack));
  }
}
