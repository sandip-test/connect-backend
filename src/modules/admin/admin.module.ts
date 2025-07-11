import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../user/entity/user.entity';
import { Organization } from 'src/auth/organization/entities/organization.entity';
import { Sponsor } from 'src/auth/sponsor/entities/sponsor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization, Sponsor])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}