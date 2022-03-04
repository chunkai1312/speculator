import { Module } from '@nestjs/common';
import { InitCommand } from './init.command';

@Module({
  providers: [InitCommand],
})
export class CommandsModule {}
