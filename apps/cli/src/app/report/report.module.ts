import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportService } from './report.service';
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
  ],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
