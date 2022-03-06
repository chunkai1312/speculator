import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportService } from './report.service';

@Module({
  imports: [
    ClientsModule.register([{
      name: 'api',
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
