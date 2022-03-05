import { Module } from '@nestjs/common';
import { CommandsModule } from './commands/commands.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [CommandsModule, ReportModule],
})
export class AppModule {}
