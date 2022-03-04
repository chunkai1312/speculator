import { Module } from '@nestjs/common';
import { TickersModule } from 'src/tickers/tickers.module';
import { ReportService } from './report.service';

@Module({
  imports: [TickersModule],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
