import { DateTime } from 'luxon';
import { Console, Command, createSpinner } from 'nestjs-console';
import { ReportService } from 'src/report/report.service';
import { ExportCommandOptions } from './interfaces';

@Console()
export class ExportCommand {
  constructor(private readonly reportService: ReportService) {}

  @Command({
    command: 'export',
    description: '匯出盤後籌碼資訊',
    options: [{
      flags: '-d, --date [date]',
      description: '指定日期',
      defaultValue: DateTime.local().toISODate(),
      fn: (value) => DateTime.fromISO(value).isValid && value || DateTime.local().toISODate(),
    }, {
      flags: '-n, --days [n]',
      description: '匯出最近 n 個交易日的大盤籌碼資訊',
      defaultValue: 30,
      fn: (value, previous) => isNaN(+value) ? previous : +value,
    }, {
      flags: '--filename [name]',
      description: '指定檔案名稱',
      defaultValue: `${DateTime.local().toFormat('yyyyMMdd')}-盤後籌碼資訊.xlsx`,
      fn: (value, previous) => value ? `${value.replace('.xlsx', '')}.xlsx` : previous,
    }],
  })
  async commandHandler(options: ExportCommandOptions): Promise<void> {
    const spin = createSpinner();

    await this.exportReport(options);

    spin.succeed(`${options.date} 盤後籌碼已匯出`);
  }

  async exportReport(options: ExportCommandOptions) {
    try {
      await this.reportService.export(options);
    } catch(e) {
      console.error(e);
    }
  }
}
