import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);  

  const config = new DocumentBuilder()
  .setTitle('Sayapatri API')
  .setDescription('API documentation for Sayapatri API')
  .setVersion('1.0')
  .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  console.log(`API documentation available at: ${process.env.PORT}/api`);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
