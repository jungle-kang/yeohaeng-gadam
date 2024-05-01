import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {setupSwagger} from "./util/swagger";
import * as dotenv from 'dotenv';
async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  await app.listen(3000);
}
bootstrap();
