import { Injectable, BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { RegistrationResponse } from 'src/common/interfaces/registration-response.interface';
import { OrganizationRegistrationDto } from './dto/organization-registration.dto';
import { FileUploadService } from 'src/config/upload/file-upload.service';
import { Sector } from 'src/common/enums';

/**
 * Service responsible for handling organization registration business logic
 */
@Injectable()
export class OrganizationRegistrationService {
  private readonly logger = new Logger(OrganizationRegistrationService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * Registers a new organization in the system
   */
  async registerOrganization(
    dto: OrganizationRegistrationDto,
    files: { organizationLogo: Express.Multer.File; registrationCertificate: Express.Multer.File },
  ): Promise<RegistrationResponse> {
    this.logger.log(`Starting organization registration for: ${dto.organizationName}`);

    // Validate that 'otherSectors' is not provided if 'OTHERS' is not a chosen sector
    if (dto.otherSectors && !dto.sectorsYouWorkIn.includes(Sector.OTHERS)) {
      throw new BadRequestException('Cannot provide otherSectors without selecting the "OTHERS" sector.');
    }

    try {
      await this.validateUniqueness(dto.registrationNumber, dto.emailAddress);

      const uploadedFiles = await this.handleFileUploads(files);

      const organization = this.organizationRepository.create({
        ...dto,
        organizationLogoPath: uploadedFiles.logoPath,
        registrationCertificatePath: uploadedFiles.certificatePath,
        organizationLogoPublicId: uploadedFiles.logoPublicId,
        registrationCertificatePublicId: uploadedFiles.certificatePublicId,
      });

      const savedOrganization = await this.organizationRepository.save(organization);
      this.logger.log(`Organization registered successfully with ID: ${savedOrganization.id}`);

      return {
        success: true,
        message: 'Organization registered successfully. Please wait for verification.',
        data: {
          id: savedOrganization.id,
          organizationName: savedOrganization.organizationName,
          emailAddress: savedOrganization.emailAddress,
          registrationNumber: savedOrganization.registrationNumber,
          isVerified: savedOrganization.isVerified,
          createdAt: savedOrganization.createdAt,
        },
      };
    } catch (error) {
      this.logger.error(`Organization registration failed: ${error.message}`, error.stack);
      // Re-throw known exceptions directly
      if (error instanceof ConflictException || error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      // Generic error for unknown issues
      throw new BadRequestException('Organization registration failed. Please try again.');
    }
  }

  /**
   * Validates that the organization registration number and email are unique
   */
  private async validateUniqueness(registrationNumber: string, emailAddress: string): Promise<void> {
    const existingOrg = await this.organizationRepository.findOne({
      where: [{ registrationNumber }, { emailAddress }],
    });

    if (existingOrg) {
      if (existingOrg.registrationNumber === registrationNumber) {
        throw new ConflictException(`Organization with registration number "${registrationNumber}" already exists.`);
      }
      if (existingOrg.emailAddress === emailAddress) {
        throw new ConflictException(`Organization with email address "${emailAddress}" already exists.`);
      }
    }
  }

  /**
   * Handles file uploads for organization logo and registration certificate
   * @returns Promise containing file paths and public IDs
   */
  private async handleFileUploads(files: {
    organizationLogo: Express.Multer.File;
    registrationCertificate: Express.Multer.File;
  }): Promise<{ logoPath: string; certificatePath: string; logoPublicId: string; certificatePublicId: string }> {
    try {
      const [logoResult, certificateResult] = await Promise.all([
        this.fileUploadService.uploadFile(files.organizationLogo, 'organization-logos', ['image/jpeg', 'image/png', 'image/jpg'], 5 * 1024 * 1024),
        this.fileUploadService.uploadFile(files.registrationCertificate, 'organization-certificates', ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'], 10 * 1024 * 1024),
      ]);

      return {
        logoPath: logoResult.secure_url,
        certificatePath: certificateResult.secure_url,
        logoPublicId: logoResult.public_id,
        certificatePublicId: certificateResult.public_id,
      };
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`, error.stack);
      throw new BadRequestException('File upload failed. Please ensure files meet the type and size requirements.');
    }
  }

  /**
   * Retrieves organization by ID
   */
  async getOrganizationById(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({ where: { id } });

    if (!organization) {
      // FIX: Use NotFoundException for better HTTP semantics.
      throw new NotFoundException(`Organization with ID "${id}" not found.`);
    }

    return organization;
  }

  /**
   * Retrieves all organizations with pagination
   */
  async getAllOrganizations(page: number, limit: number) {
    const [organizations, total] = await this.organizationRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: organizations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}