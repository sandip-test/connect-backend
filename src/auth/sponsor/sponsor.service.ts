import { Injectable, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrationResponse } from 'src/common/interfaces/registration-response.interface';
import { Sponsor } from './entities/sponsor.entity';
import { SponsorRegistrationDto } from './dto/sponsor-registration.dto';
import { FileUploadService } from 'src/config/upload/file-upload.service';


/**
 * Service responsible for handling sponsor registration business logic
 * Includes validation, file upload, and database operations
 */
@Injectable()
export class SponsorRegistrationService {
  private readonly logger = new Logger(SponsorRegistrationService.name);

  constructor(
    @InjectRepository(Sponsor)
    private readonly sponsorRepository: Repository<Sponsor>,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * Registers a new sponsor in the system
   * @param dto Sponsor registration data
   * @param files Uploaded files (logo and certificate)
   * @returns Promise<RegistrationResponse> Registration result
   * @throws BadRequestException If validation fails
   * @throws ConflictException If sponsor already exists
   */
  async registerSponsor(
    dto: SponsorRegistrationDto,
    files: { companyLogo: Express.Multer.File; registrationCertificate: Express.Multer.File }
  ): Promise<RegistrationResponse> {
    this.logger.log(`Starting sponsor registration for: ${dto.companyName}`);

    try {
      // Check if sponsor already exists
      await this.validateUniqueness(dto.registrationNumber, dto.emailAddress);

      // Validate and upload files
      const uploadedFiles = await this.handleFileUploads(files);

      // Create sponsor entity
      const sponsor = this.sponsorRepository.create({
        ...dto,
        companyLogoPath: uploadedFiles.logoPath,
        registrationCertificatePath: uploadedFiles.certificatePath,
      });

      // Save to database
      const savedSponsor = await this.sponsorRepository.save(sponsor);

      this.logger.log(`Sponsor registered successfully with ID: ${savedSponsor.id}`);

      return {
        success: true,
        message: 'Sponsor registered successfully. Please wait for verification.',
        data: {
          id: savedSponsor.id,
          companyName: savedSponsor.companyName,
          emailAddress: savedSponsor.emailAddress,
          registrationNumber: savedSponsor.registrationNumber,
          isVerified: savedSponsor.isVerified,
          createdAt: savedSponsor.createdAt,
        },
      };
    } catch (error) {
      this.logger.error(`Sponsor registration failed: ${error.message}`, error.stack);
      
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Sponsor registration failed. Please try again.');
    }
  }

  /**
   * Validates that the sponsor registration number and email are unique
   * @param registrationNumber Sponsor registration number
   * @param emailAddress Sponsor email address
   * @throws ConflictException If sponsor already exists
   */
  private async validateUniqueness(registrationNumber: string, emailAddress: string): Promise<void> {
    const existingSponsor = await this.sponsorRepository.findOne({
      where: [
        { registrationNumber },
        { emailAddress },
      ],
    });

    if (existingSponsor) {
      if (existingSponsor.registrationNumber === registrationNumber) {
        throw new ConflictException('Sponsor with this registration number already exists');
      }
      if (existingSponsor.emailAddress === emailAddress) {
        throw new ConflictException('Sponsor with this email address already exists');
      }
    }
  }

/**
 * Handles file uploads for company logo and registration certificate
 * @param files Uploaded files
 * @returns Promise<{logoPath: string, certificatePath: string}> File paths
 * @throws BadRequestException If file upload fails
 */
private async handleFileUploads(files: {
  companyLogo: Express.Multer.File;
  registrationCertificate: Express.Multer.File;
}): Promise<{ logoPath: string; certificatePath: string; logoPublicId: string; certificatePublicId: string }> {
  try {
    // Upload company logo
    const logoResult = await this.fileUploadService.uploadFile(
      files.companyLogo,
      'sponsor-logos',
      ['image/jpeg', 'image/png', 'image/jpg'],
      5 * 1024 * 1024 // 5MB limit
    );

    // Upload registration certificate
    const certificateResult = await this.fileUploadService.uploadFile(
      files.registrationCertificate,
      'sponsor-certificates',
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
   * Retrieves sponsor by ID
   * @param id Sponsor ID
   * @returns Promise<Sponsor> Sponsor entity
   */
  async getSponsorById(id: string): Promise<Sponsor> {
    const sponsor = await this.sponsorRepository.findOne({
      where: { id },
    });

    if (!sponsor) {
      throw new BadRequestException('Sponsor not found');
    }

    return sponsor;
  }

  /**
   * Retrieves all sponsors with pagination
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @returns Promise<{sponsors: Sponsor[], total: number, page: number, limit: number}>
   */
  async getAllSponsors(page: number = 1, limit: number = 10) {
    const [sponsors, total] = await this.sponsorRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      sponsors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}