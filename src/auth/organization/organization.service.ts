import { Injectable, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { RegistrationResponse } from 'src/common/interfaces/registration-response.interface';
import { OrganizationRegistrationDto } from './dto/organization-registration.dto';
import { FileUploadService } from 'src/config/upload/file-upload.service';

/**
 * Service responsible for handling organization registration business logic
 * Includes validation, file upload, and database operations
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
   * @param dto Organization registration data
   * @param files Uploaded files (logo and certificate)
   * @returns Promise<RegistrationResponse> Registration result
   * @throws BadRequestException If validation fails
   * @throws ConflictException If organization already exists
   */
  async registerOrganization(
    dto: OrganizationRegistrationDto,
    files: { organizationLogo: Express.Multer.File; registrationCertificate: Express.Multer.File }
  ): Promise<RegistrationResponse> {
    this.logger.log(`Starting organization registration for: ${dto.organizationName}`);

    try {
      // Check if organization already exists
      await this.validateUniqueness(dto.registrationNumber, dto.emailAddress);

      // Validate and upload files
      const uploadedFiles = await this.handleFileUploads(files);

      // Create organization entity
      const organization = this.organizationRepository.create({
        ...dto,
        organizationLogoPath: uploadedFiles.logoPath,
        registrationCertificatePath: uploadedFiles.certificatePath,
      });

      // Save to database
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
      
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Organization registration failed. Please try again.');
    }
  }

  /**
   * Validates that the organization registration number and email are unique
   * @param registrationNumber Organization registration number
   * @param emailAddress Organization email address
   * @throws ConflictException If organization already exists
   */
  private async validateUniqueness(registrationNumber: string, emailAddress: string): Promise<void> {
    const existingOrganization = await this.organizationRepository.findOne({
      where: [
        { registrationNumber },
        { emailAddress },
      ],
    });

    if (existingOrganization) {
      if (existingOrganization.registrationNumber === registrationNumber) {
        throw new ConflictException('Organization with this registration number already exists');
      }
      if (existingOrganization.emailAddress === emailAddress) {
        throw new ConflictException('Organization with this email address already exists');
      }
    }
  }

/**
 * Handles file uploads for company logo and registration certificate
 * @param files Uploaded files
 * @returns Promise<{logoPath: string, certificatePath: string}> File paths
 * @throws BadRequestException If file upload fails
 */
/**
 * Handles file uploads for organization logo and registration certificate
 * @param files Uploaded files
 * @returns Promise<{logoPath: string, certificatePath: string, logoPublicId: string, certificatePublicId: string}> File paths and public IDs
 * @throws BadRequestException If file upload fails
 */
private async handleFileUploads(files: {
  organizationLogo: Express.Multer.File;
  registrationCertificate: Express.Multer.File;
}): Promise<{ logoPath: string; certificatePath: string; logoPublicId: string; certificatePublicId: string }> {
  try {
    // Upload organization logo
    const logoResult = await this.fileUploadService.uploadFile(
      files.organizationLogo,
      'organization-logos',
      ['image/jpeg', 'image/png', 'image/jpg'],
      5 * 1024 * 1024 // 5MB limit
    );

    // Upload registration certificate
    const certificateResult = await this.fileUploadService.uploadFile(
      files.registrationCertificate,
      'organization-certificates',
      ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
      10 * 1024 * 1024 // 10MB limit
    );

    return { 
      logoPath: logoResult.secure_url, 
      certificatePath: certificateResult.secure_url,
      logoPublicId: logoResult.public_id,
      certificatePublicId: certificateResult.public_id
    };
  } catch (error) {
    this.logger.error(`File upload failed: ${error.message}`, error.stack);
    throw new BadRequestException('File upload failed. Please ensure files meet the requirements.');
  }
}

  /**
   * Retrieves organization by ID
   * @param id Organization ID
   * @returns Promise<Organization> Organization entity
   */
  async getOrganizationById(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new BadRequestException('Organization not found');
    }

    return organization;
  }

  /**
   * Retrieves all organizations with pagination
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @returns Promise<{organizations: Organization[], total: number, page: number, limit: number}>
   */
  async getAllOrganizations(page: number = 1, limit: number = 10) {
    const [organizations, total] = await this.organizationRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      organizations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}