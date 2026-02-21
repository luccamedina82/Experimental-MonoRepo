import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { fastifyCookie } from '@fastify/cookie';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  const configService = app.get(ConfigService);
  await app.register(fastifyCookie, {
    secret: configService.get<string>('JWT_SECRET'),
  });

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN'),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.enableShutdownHooks();
  const shutdown = async () => {
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('SIGHUP', shutdown);
  process.stdin.resume();
  process.stdin.on('end', shutdown);



  // Escuchar en 0.0.0.0 es vital para Docker/Red local
  await app.listen(3000, '0.0.0.0');
  console.log(`API is running in: ${await app.getUrl()}`);
}
bootstrap();