import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportService } from './report.service';

@Module({
  imports: [
    ClientsModule.register([{
      name: 'api',
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3001,
      },
    }]),
  ],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
