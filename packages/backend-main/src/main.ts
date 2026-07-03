import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // auto prefix path with /api/plugins
  // since gateway is configured to forward /api/plugins to this backend
  // https://github.com/AhaSlides-Product/terraform/blob/0e86303174d5c8aa3ae6240425e3ba37b4ad9779/sites/dev01/apigw.tf#L227 
  app.setGlobalPrefix('api/plugins');
  app.enableShutdownHooks(['SIGTERM', 'SIGINT'], { useProcessExit: true });
  // keep-alive conns can hang httpServer.close(), so force exit after 25s, before ECS's 30s grace period
  const forceExit = () => {
    setTimeout(() => process.exit(0), 25_000).unref();
  };
  process.once('SIGTERM', forceExit);
  process.once('SIGINT', forceExit);
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Main backend is running on: http://0.0.0.0:${port}`);
}
bootstrap();
