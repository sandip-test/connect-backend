import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Modules
import { UserModule } from 'src/modules/user/user.module';
import { UploadModule } from 'src/config/upload/upload.module';

// Entities
import { User } from 'src/modules/user/entity/user.entity'; 
import { Organization } from './organization/entities/organization.entity';
import { Sponsor } from './sponsor/entities/sponsor.entity';

// Services
import { OrganizationRegistrationService } from './organization/organization.service';
import { SponsorRegistrationService } from './sponsor/sponsor.service';
import { AuthService } from './auth.service';

// Controllers
import { OrganizationRegistrationController } from './organization/organization.controller';
import { SponsorRegistrationController } from './sponsor/sponsor.controller';
import { AuthController } from './auth.controller';

// Strategies
import { JwtStrategy } from 'src/config/strategy/jwt.strategy';
import { LocalStrategy } from 'src/config/strategy/local.strategy';

@Module({
  imports: [
    UserModule,
    UploadModule,
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([Organization, Sponsor, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    OrganizationRegistrationController,
    SponsorRegistrationController,
    AuthController,
  ],
  providers: [
    OrganizationRegistrationService,
    SponsorRegistrationService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
  ],
  exports: [OrganizationRegistrationService, SponsorRegistrationService],
})
export class AuthModule {}