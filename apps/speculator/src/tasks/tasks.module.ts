import { Module } from '@nestjs/common';
import { TickersModule } from '../tickers/tickers.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [TickersModule],
  providers: [TasksService],
})
export class TasksModule {}
