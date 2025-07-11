import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { AdminSeedService } from '../admin/seed/admin-seed.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    ConfigModule 
  ], 
  providers: [
    UserService, 
    AdminSeedService 
  ], 
  exports: [
    UserService, 
    AdminSeedService 
  ], 
})
export class UserModule {}