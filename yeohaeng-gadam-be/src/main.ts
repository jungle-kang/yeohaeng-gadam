import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from "./util/swagger";
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { WebsocketAdapter } from './chat/websocket-adapter';
async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  app.enableCors({
    // origin: configService.get('process.env.FRONTEND_URL'),
    origin: '*',
  });

  app.useWebSocketAdapter(
    new WebsocketAdapter(app, {
      // origin: configService.get('process.env.FRONTEND_URL'),
      origin: '*',
    }),
  );

  setupSwagger(app);
  await app.listen(3000);
}
bootstrap();
