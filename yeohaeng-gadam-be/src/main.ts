import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './util/swagger';
import { ConfigService } from '@nestjs/config';
import { WebsocketAdapter } from './chat/websocket-adapter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const frontendUrl = configService.get('FRONTEND_URL');
  app.enableCors({
    origin: frontendUrl,
    // origin: '*',
    credentials: true,
  });

  app.useWebSocketAdapter(
    new WebsocketAdapter(app, {
      // origin: frontendUrl,
      origin: '*',
      credentials: true,
    }),
  );

  setupSwagger(app);
  await app.listen(3000);
}
bootstrap();
