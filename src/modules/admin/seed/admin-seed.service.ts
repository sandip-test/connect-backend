import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { Role } from 'src/common/enums/role.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminSeedService {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Seeds the database with a default admin user if it doesn't already exist.
   */
  async seedAdmin() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    // Check if the admin user already exists
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      this.logger.log('Admin user already exists. Skipping seed.');
      return;
    }

    // If no admin exists, create one
    const adminUser = this.userRepository.create({
      email: adminEmail,
      password: adminPassword, 
      role: Role.ADMIN,
      isVerified: true, // Admins are verified by default
    });

    await this.userRepository.save(adminUser);
    this.logger.log('Default admin user has been created successfully.');
  }
}