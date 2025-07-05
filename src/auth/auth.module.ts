import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

// Entities
import { Organization } from './organization/entities/organization.entity';
import { Sponsor } from './sponsor/entities/sponsor.entity';


// Services
import { OrganizationRegistrationService } from './organization/organization.service';
import { SponsorRegistrationService } from './sponsor/sponsor.service';

// Controllers
import { OrganizationRegistrationController } from './organization/organization.controller';
import { SponsorRegistrationController } from './sponsor/sponsor.controller';

// Upload module
import { UploadModule } from 'src/config/upload/upload.module';

/**
 * Auth Module
 * Handles all authentication and registration related functionality
 */
@Module({
  imports: [
    // TypeORM entities
    TypeOrmModule.forFeature([Organization, Sponsor]),
    
    // Multer configuration for file uploads
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
    
    // Upload module for file handling
    UploadModule,
  ],
  controllers: [
    OrganizationRegistrationController,
    SponsorRegistrationController,
  ],
  providers: [
    OrganizationRegistrationService,
    SponsorRegistrationService,
  ],
  exports: [
    OrganizationRegistrationService,
    SponsorRegistrationService,
  ],
})
export class AuthModule {}