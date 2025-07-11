import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AdminSeedService } from './modules/admin/seed/admin-seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- RUN THE ADMIN SEEDER ---
  const adminSeeder = app.get(AdminSeedService);
  await adminSeeder.seedAdmin();
  // -----------------------------

  const config = new DocumentBuilder()
    .setTitle('Sayapatri API')
    .setDescription('API documentation for Sayapatri API')
    .setVersion('1.0')
    .addBearerAuth() // Important for testing protected endpoints in Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Docs is available on http://localhost:${port}/api`);
}
bootstrap();