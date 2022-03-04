import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { TickersModule } from 'src/tickers/tickers.module';
import { ReportModule } from 'src/report/report.module';
import { InitCommand } from './init.command';
import { UpdateCommand } from './update.command';
import { ExportCommand } from './export.command';

@Module({
  imports: [ConsoleModule, TickersModule, ReportModule],
  providers: [InitCommand, UpdateCommand, ExportCommand],
})
export class CommandsModule {}
