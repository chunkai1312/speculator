import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportModule } from '../report';
import { InitCommand } from './init.command';
import { UpdateCommand } from './update.command';
import { ExportCommand } from './export.command';
import { API_SERVICE } from '../constants';

@Module({
  imports: [
    ClientsModule.register([{
      name: API_SERVICE,
      transport: Transport.TCP,
      options: {
        host: process.env.API_HOST,
        port: Number(process.env.API_SERVICE_PORT),
      },
    }]),
    ReportModule,
  ],
  providers: [InitCommand, UpdateCommand, ExportCommand],
})
export class CommandsModule {}
