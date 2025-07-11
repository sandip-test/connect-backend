import { Injectable, BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrationResponse } from 'src/common/interfaces/registration-response.interface';
import { Sponsor } from './entities/sponsor.entity';
import { SponsorRegistrationDto } from './dto/sponsor-registration.dto';
import { FileUploadService } from 'src/config/upload/file-upload.service';
import { Sector } from 'src/common/enums';

/**
 * Service responsible for handling sponsor registration business logic
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
   */
  async registerSponsor(
    dto: SponsorRegistrationDto,
    files: { companyLogo: Express.Multer.File; registrationCertificate: Express.Multer.File },
  ): Promise<RegistrationResponse> {
    this.logger.log(`Starting sponsor registration for: ${dto.companyName}`);

    if (dto.otherWorkSectors && !dto.sectorsOfWork.includes(Sector.OTHERS)) {
      throw new BadRequestException('Cannot provide otherWorkSectors without selecting the "OTHERS" work sector.');
    }
    if (dto.otherSponsorshipSectors && !dto.sectorsInterestedToSponsor.includes(Sector.OTHERS)) {
        throw new BadRequestException('Cannot provide otherSponsorshipSectors without selecting the "OTHERS" sponsorship sector.');
    }

    try {
      await this.validateUniqueness(dto.registrationNumber, dto.emailAddress);

      const uploadedFiles = await this.handleFileUploads(files);

      const sponsor = this.sponsorRepository.create({
        ...dto,
        companyLogoPath: uploadedFiles.logoPath,
        registrationCertificatePath: uploadedFiles.certificatePath,
        companyLogoPublicId: uploadedFiles.logoPublicId,
        registrationCertificatePublicId: uploadedFiles.certificatePublicId,
      });

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
      if (error instanceof ConflictException || error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Sponsor registration failed. Please try again.');
    }
  }

  /**
   * Validates that the sponsor registration number and email are unique
   */
  private async validateUniqueness(registrationNumber: string, emailAddress: string): Promise<void> {
    const existingSponsor = await this.sponsorRepository.findOne({
      where: [{ registrationNumber }, { emailAddress }],
    });

    if (existingSponsor) {
      if (existingSponsor.registrationNumber === registrationNumber) {
        throw new ConflictException(`Sponsor with registration number "${registrationNumber}" already exists.`);
      }
      if (existingSponsor.emailAddress === emailAddress) {
        throw new ConflictException(`Sponsor with email address "${emailAddress}" already exists.`);
      }
    }
  }

  /**
   * Handles file uploads for company logo and registration certificate
   */
  private async handleFileUploads(files: {
    companyLogo: Express.Multer.File;
    registrationCertificate: Express.Multer.File;
  }): Promise<{ logoPath: string; certificatePath: string; logoPublicId: string; certificatePublicId: string }> {
    try {
      const [logoResult, certificateResult] = await Promise.all([
        this.fileUploadService.uploadFile(files.companyLogo, 'sponsor-logos', ['image/jpeg', 'image/png', 'image/jpg'], 5 * 1024 * 1024),
        this.fileUploadService.uploadFile(files.registrationCertificate, 'sponsor-certificates', ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'], 10 * 1024 * 1024),
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
   * Retrieves sponsor by ID
   */
  async getSponsorById(id: string): Promise<Sponsor> {
    const sponsor = await this.sponsorRepository.findOne({ where: { id } });
    if (!sponsor) {
      // FIX: Use NotFoundException for better HTTP semantics.
      throw new NotFoundException(`Sponsor with ID "${id}" not found.`);
    }
    return sponsor;
  }

  /**
   * Retrieves all sponsors with pagination
   */
  async getAllSponsors(page: number, limit: number) {
    const [sponsors, total] = await this.sponsorRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: sponsors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}