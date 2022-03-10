import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TickerType, Exchange, Market } from '@speculator/common';

export type TickerDocument = Ticker & Document;

@Schema()
export class Ticker {
  @Prop({ type: String, required: true })
  date: string;

  @Prop({ type: String, required: true })
  type: TickerType;

  @Prop({ type: String, required: true })
  exchange: Exchange;

  @Prop({ type: String, required: true })
  market: Market;

  @Prop({ type: String, required: true })
  symbol: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: Number })
  openPrice: number;

  @Prop({ type: Number })
  highPrice: number;

  @Prop({ type: Number })
  lowPrice: number;

  @Prop({ type: Number })
  closePrice: number;

  @Prop({ type: Number })
  change: number;

  @Prop({ type: Number })
  changePercent: number;

  @Prop({ type: Number })
  tradeVolume: number;

  @Prop({ type: Number })
  tradeValue: number;

  @Prop({ type: Number })
  transaction: number;

  @Prop({ type: Number })
  tradeWeight: number;

  @Prop({ type: Number })
  qfiiNetBuySell: number;

  @Prop({ type: Number })
  siteNetBuySell: number;

  @Prop({ type: Number })
  dealersNetBuySell: number;

  @Prop({ type: Number })
  marginPurchase: number;

  @Prop({ type: Number })
  marginPurchaseChange: number;

  @Prop({ type: Number })
  shortSale: number;

  @Prop({ type: Number })
  shortSaleChange: number;

  @Prop({ type: Number })
  qfiiTxNetOi: number;

  @Prop({ type: Number })
  qfiiTxoCallsNetOi: number;

  @Prop({ type: Number })
  qfiiTxoCallsNetOiValue: number;

  @Prop({ type: Number })
  qfiiTxoPutsNetOi: number;

  @Prop({ type: Number })
  qfiiTxoPutsNetOiValue: number;

  @Prop({ type: Number })
  top10TxFrontMonthNetOi: number;

  @Prop({ type: Number })
  top10TxBackMonthsNetOi: number;

  @Prop({ type: Number })
  retailMtxNetOi: number;

  @Prop({ type: Number })
  retailMtxLongShortRatio: number;

  @Prop({ type: Number })
  pcRatio: number;

  @Prop({ type: Number })
  usdtwd: number;
}

export const TickerSchema = SchemaFactory.createForClass(Ticker)
  .index({ date: -1 })
  .index({ date: -1, type: 1 })
  .index({ date: -1, type: 1, exchange: 1 })
  .index({ date: -1, type: 1, market: 1 })
  .index({ date: -1, type: 1, exchange: 1, market: 1 })
  .index({ date: -1, symbol: 1 })
  .index({ date: -1, type: 1, symbol: 1 })
  .index({ date: -1, type: 1, exchange: 1, symbol: 1 })
  .index({ date: -1, type: 1, market: 1, symbol: 1 })
  .index({ date: -1, type: 1, exchange: 1, market: 1, symbol: 1 }, { unique: true });
