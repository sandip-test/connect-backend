import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { Organization } from 'src/auth/organization/entities/organization.entity';
import { Sponsor } from 'src/auth/sponsor/entities/sponsor.entity';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(Sponsor)
    private readonly sponsorRepository: Repository<Sponsor>,
    private readonly dataSource: DataSource,
  ) {}

  async getUnverifiedOrganizations() {
    return this.organizationRepository.find({ where: { isVerified: false } });
  }

  async getUnverifiedSponsors() {
    return this.sponsorRepository.find({ where: { isVerified: false } });
  }

  async verifyOrganization(id: string): Promise<{ message: string }> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['user'], // IMPORTANT: Load the related user
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID "${id}" not found.`);
    }

    if (!organization.user) {
        throw new NotFoundException(`User for organization "${id}" not found. Data inconsistency.`);
    }

    // Use a transaction to update both entities
    await this.dataSource.transaction(async (manager) => {
      await manager.update(Organization, id, { isVerified: true });
      await manager.update(User, organization.user.id, { isVerified: true });
    });
    
    this.logger.log(`Organization verified successfully: ${id}`);
    return { message: 'Organization verified successfully.' };
  }

  async verifySponsor(id: string): Promise<{ message: string }> {
    const sponsor = await this.sponsorRepository.findOne({
        where: { id },
        relations: ['user'], // IMPORTANT: Load the related user
    });

    if (!sponsor) {
        throw new NotFoundException(`Sponsor with ID "${id}" not found.`);
    }

    if (!sponsor.user) {
        throw new NotFoundException(`User for sponsor "${id}" not found. Data inconsistency.`);
    }

    await this.dataSource.transaction(async (manager) => {
        await manager.update(Sponsor, id, { isVerified: true });
        await manager.update(User, sponsor.user.id, { isVerified: true });
    });

    this.logger.log(`Sponsor verified successfully: ${id}`);
    return { message: 'Sponsor verified successfully.' };
  }
}