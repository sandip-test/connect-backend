import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from 'src/config/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { UploadModule } from 'src/config/upload/upload.module';
import { AdminModule } from 'src/modules/admin/admin.module';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    DatabaseModule,
    UploadModule,
    AuthModule,
    UserModule,
    AdminModule,
  ],  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
