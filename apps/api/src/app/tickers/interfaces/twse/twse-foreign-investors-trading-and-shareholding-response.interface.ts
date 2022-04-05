export interface TwseForeignInvestorsTradingAndShareholdingResponse {
  stat: string;
  date: string;
  selectType?: string;
  title: string;
  fields: string[];
  data: Array<string[]>;
  notes?: string[];
}
