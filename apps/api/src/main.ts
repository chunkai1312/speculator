import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.API_HOST,
      port: Number(process.env.API_SERVICE_PORT),
      retryAttempts: 5,
      retryDelay: 3000,
    },
  });
  await app.listen();
  Logger.log(`🚀 Application is running`);
}
bootstrap();
