import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportModule } from '../report/report.module';
import { InitCommand } from './init.command';
import { UpdateCommand } from './update.command';
import { ExportCommand } from './export.command';

@Module({
  imports: [
    ClientsModule.register([{
      name: 'service-ticker',
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3001,
      },
    }]),
    ReportModule,
  ],
  providers: [InitCommand, UpdateCommand, ExportCommand],
})
export class CommandsModule {}
