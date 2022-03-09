import * as ora from 'ora';
import { DateTime } from 'luxon';
import { Command, CommandRunner, Option } from 'nest-commander';
import { ReportService } from '../report/report.service';

interface ExportCommandOptions {
  date: string;
  filename: string;
  days: number;
}

@Command({ name: 'export', description: '匯出盤後籌碼報告' })
export class ExportCommand implements CommandRunner {
  private readonly spinner = ora();

  constructor(private readonly reportService: ReportService) {}

  async run(passedParam: string[], options?: ExportCommandOptions): Promise<void> {
    try {
      this.spinner.start('正在匯出盤後籌碼報告...');
      await this.exportReport(options);
      this.spinner.succeed(`${options.date} 盤後籌碼報告已匯出`);
    } catch (err) {
      this.spinner.fail('執行階段錯誤');
      console.log(err);
    }
  }

  @Option({
    flags: '-d, --date [date]',
    description: '指定交易日',
    defaultValue: DateTime.local().toISODate(),
  })
  parseDate(value: string): string {
    return DateTime.fromISO(value).isValid && value || DateTime.local().toISODate();
  }

  @Option({
    flags: '-n, --days [n]',
    description: '匯出最近 n 個交易日的大盤籌碼資訊',
    // @ts-expect-error
    defaultValue: 30,
  })
  parseDays(value: string, previous: number): number {
    return isNaN(+value) ? +previous : +value;
  }

  @Option({
    flags: '--filename [name]',
    description: '指定檔案名稱',
    defaultValue: `${DateTime.local().toFormat('yyyyMMdd')}-盤後籌碼資訊.xlsx`,
  })
  parseFilename(value: string, previous: string): string {
    return value ? `${value.replace('.xlsx', '')}.xlsx` : previous;
  }

  async exportReport(options: ExportCommandOptions) {
    await this.reportService.export(options);
  }
}
