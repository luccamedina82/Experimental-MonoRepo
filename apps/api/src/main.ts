import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  // Escuchar en 0.0.0.0 es vital para Docker/Red local
  await app.listen(3000, '0.0.0.0');
  console.log(`API is running in: ${await app.getUrl()}`);
}
bootstrap();