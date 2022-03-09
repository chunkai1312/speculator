export interface TwseMarginTransactionsResponse {
  stat: string;
  creditTitle: string;
  creditFields: string[],
  creditList: Array<string[]>;
  creditNotes: string[],
  title: string;
  fields: string[];
  groups: string[];
  data: string;
  date: string;
  notes: string[];
  selectType: string;
}
