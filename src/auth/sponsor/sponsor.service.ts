import { Injectable, BadRequestException, ConflictException, Logger, NotFoundException,ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sponsor } from './entities/sponsor.entity';
import { User } from 'src/modules/user/entity/user.entity';
import {  Sector } from 'src/common/enums';
import { SponsorRegistrationDto } from './dto/sponsor-registration.dto';
import { FileUploadService } from 'src/config/upload/file-upload.service';
import { RegistrationResponse } from 'src/common/interfaces/registration-response.interface';
import { Role } from 'src/common/enums/role.enum';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';


/**
 * Service responsible for handling sponsor registration business logic
 */
@Injectable()
export class SponsorRegistrationService {
  private readonly logger = new Logger(SponsorRegistrationService.name);

  constructor(
    @InjectRepository(Sponsor)
    private readonly sponsorRepository: Repository<Sponsor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly fileUploadService: FileUploadService,
    private readonly dataSource: DataSource, // Inject DataSource for transactions
  ) {}

  /**
   * Registers a new sponsor and its corresponding user account in a transaction.
   * @param dto - The sponsor registration data transfer object.
   * @param files - The uploaded files for the company logo and certificate.
   * @returns A standardized registration response.
   */
  async registerSponsor(
    dto: SponsorRegistrationDto,
    files: { companyLogo: Express.Multer.File; registrationCertificate: Express.Multer.File },
  ): Promise<RegistrationResponse> {
    this.logger.log(`Registration attempt for sponsor: ${dto.companyName}`);

    // --- Pre-checks for data integrity ---
    if (dto.otherWorkSectors && !dto.sectorsOfWork.includes(Sector.OTHERS)) {
      throw new BadRequestException('Cannot provide otherWorkSectors if "OTHERS" is not selected.');
    }
    if (dto.otherSponsorshipSectors && !dto.sectorsInterestedToSponsor.includes(Sector.OTHERS)) {
        throw new BadRequestException('Cannot provide otherSponsorshipSectors if "OTHERS" is not selected.');
    }

    const existingUser = await this.userRepository.findOne({ where: { email: dto.emailAddress } });
    if (existingUser) {
      throw new ConflictException(`User with email "${dto.emailAddress}" already exists.`);
    }

    const existingSponsor = await this.sponsorRepository.findOne({ where: { registrationNumber: dto.registrationNumber } });
    if (existingSponsor) {
      throw new ConflictException(`Sponsor with registration number "${dto.registrationNumber}" already exists.`);
    }
    
    // --- File Uploads ---
    const uploadedFiles = await this.handleFileUploads(files);

    // --- Transactional Registration ---
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create the User entity
      const user = queryRunner.manager.create(User, {
        email: dto.emailAddress,
        password: dto.password, // The @BeforeInsert hook on the User entity will hash this
        role: Role.SPONSOR,
        isVerified: false,
      });
      const savedUser = await queryRunner.manager.save(user);

      // 2. Create the Sponsor profile and link it to the new User
      const sponsor = queryRunner.manager.create(Sponsor, {
        ...dto,
        companyLogoPath: uploadedFiles.logoPath,
        registrationCertificatePath: uploadedFiles.certificatePath,
        companyLogoPublicId: uploadedFiles.logoPublicId,
        registrationCertificatePublicId: uploadedFiles.certificatePublicId,
        user: savedUser, // Link the sponsor profile to the user
        isVerified: false,
      });
      const savedSponsor = await queryRunner.manager.save(sponsor);

      // If all operations succeed, commit the transaction
      await queryRunner.commitTransaction();
      this.logger.log(`Sponsor and User created successfully. Sponsor ID: ${savedSponsor.id}`);

      return {
        success: true,
        message: 'Sponsor registered successfully. Please wait for verification.',
        data: {
          id: savedSponsor.id,
          companyName: savedSponsor.companyName,
          emailAddress: user.email,
          registrationNumber: savedSponsor.registrationNumber,
          isVerified: savedSponsor.isVerified,
          createdAt: savedSponsor.createdAt,
        },
      };
    } catch (error) {
      // If any error occurs, roll back the entire transaction
      await queryRunner.rollbackTransaction();
      this.logger.error(`Sponsor registration failed: ${error.message}`, error.stack);
      throw new BadRequestException('Sponsor registration failed. Please check your data and try again.');
    } finally {
      // Always release the query runner to free up the connection
      await queryRunner.release();
    }
  }

  /**
   * Handles file uploads for company logo and registration certificate.
   * @param files - The multer file objects.
   * @returns A promise with the secure URLs and public IDs of the uploaded files.
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
      this.logger.error(`File upload failed during sponsor registration: ${error.message}`, error.stack);
      throw new BadRequestException('File upload failed. Please ensure files meet the type and size requirements.');
    }
  }

  /**
   * Retrieves a single sponsor by their ID.
   * @param id The UUID of the sponsor.
   * @returns The sponsor entity.
   */
  async getSponsorById(id: string): Promise<Sponsor> {
    const sponsor = await this.sponsorRepository.findOne({ where: { id } });
    if (!sponsor) {
      throw new NotFoundException(`Sponsor with ID "${id}" not found.`);
    }
    return sponsor;
  }

  /**
   * Retrieves all sponsors with pagination.
   * @param page - The page number for pagination.
   * @param limit - The number of items per page.
   * @returns A paginated list of sponsors.
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

  /**
   * Updates a sponsor's profile.
   * Only the sponsor itself or an admin can perform this action.
   * @param id - The ID of the sponsor to update.
   * @param dto - The data to update.
   * @param loggedInUser - The user performing the request.
   * @param files - Optional new logo and certificate files.
   * @returns The updated sponsor entity.
   */
  async updateSponsor(
    id: string,
    dto: UpdateSponsorDto,
    loggedInUser: { userId: string; role: Role },
    files?: {
      companyLogo?: Express.Multer.File;
      registrationCertificate?: Express.Multer.File;
    },
  ) {
    this.logger.log(`Update attempt for sponsor ID: ${id}`);
    const sponsor = await this.sponsorRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!sponsor) {
      throw new NotFoundException(`Sponsor with ID "${id}" not found.`);
    }

    // --- Authorization Check ---
    if (loggedInUser.role !== Role.ADMIN && sponsor.user.id !== loggedInUser.userId) {
      throw new ForbiddenException('You are not authorized to update this sponsor.');
    }

    // --- Optional File Uploads ---
    if (files?.companyLogo) {
      if (sponsor.companyLogoPublicId) {
        await this.fileUploadService.deleteFile(sponsor.companyLogoPublicId);
      }
      const logoResult = await this.fileUploadService.uploadFile(files.companyLogo, 'sponsor-logos', ['image/jpeg', 'image/png'], 5 * 1024 * 1024);
      sponsor.companyLogoPath = logoResult.secure_url;
      sponsor.companyLogoPublicId = logoResult.public_id;
    }

    if (files?.registrationCertificate) {
      if (sponsor.registrationCertificatePublicId) {
        await this.fileUploadService.deleteFile(sponsor.registrationCertificatePublicId);
      }
      const certResult = await this.fileUploadService.uploadFile(files.registrationCertificate, 'sponsor-certificates', ['application/pdf', 'image/jpeg', 'image/png'], 10 * 1024 * 1024);
      sponsor.registrationCertificatePath = certResult.secure_url;
      sponsor.registrationCertificatePublicId = certResult.public_id;
    }

    // Merge and save the updated data
    const updatedSponsor = this.sponsorRepository.merge(sponsor, dto);
    await this.sponsorRepository.save(updatedSponsor);

    this.logger.log(`Sponsor updated successfully: ${id}`);
    return updatedSponsor;
  }
}