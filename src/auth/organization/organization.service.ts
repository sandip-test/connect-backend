import { Injectable, BadRequestException, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Sector } from 'src/common/enums';
import { Role } from 'src/common/enums/role.enum';
import { OrganizationRegistrationDto } from './dto/organization-registration.dto';
import { FileUploadService } from 'src/config/upload/file-upload.service';
import { RegistrationResponse } from 'src/common/interfaces/registration-response.interface';

@Injectable()
export class OrganizationRegistrationService {
  private readonly logger = new Logger(OrganizationRegistrationService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly fileUploadService: FileUploadService,
    private readonly dataSource: DataSource, // Inject DataSource for transactions
  ) { }

  async registerOrganization(
    dto: OrganizationRegistrationDto,
    files: { organizationLogo: Express.Multer.File; registrationCertificate: Express.Multer.File },
  ): Promise<RegistrationResponse> {
    this.logger.log(`Registration attempt for organization: ${dto.organizationName}`);

    // --- Pre-checks ---
    if (dto.otherSectors && !dto.sectorsYouWorkIn.includes(Sector.OTHERS)) {
      throw new BadRequestException('Cannot provide otherSectors if "OTHERS" is not selected.');
    }

    const existingUser = await this.userRepository.findOne({ where: { email: dto.emailAddress } });
    if (existingUser) {
      throw new ConflictException(`User with email "${dto.emailAddress}" already exists.`);
    }

    const existingOrg = await this.organizationRepository.findOne({ where: { registrationNumber: dto.registrationNumber } });
    if (existingOrg) {
      throw new ConflictException(`Organization with registration number "${dto.registrationNumber}" already exists.`);
    }

    // --- File Uploads ---
    const uploadedFiles = await this.handleFileUploads(files);

    // --- Transactional Operation ---
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create the User
      const user = queryRunner.manager.create(User, {
        email: dto.emailAddress,
        password: dto.password, // Password will be hashed by the @BeforeInsert hook
        role: Role.ORGANIZATION,
        isVerified: false,
      });
      const savedUser = await queryRunner.manager.save(user);

      // 2. Create the Organization Profile and link it to the User
      const organization = queryRunner.manager.create(Organization, {
        ...dto,
        organizationLogoPath: uploadedFiles.logoPath,
        registrationCertificatePath: uploadedFiles.certificatePath,
        organizationLogoPublicId: uploadedFiles.logoPublicId,
        registrationCertificatePublicId: uploadedFiles.certificatePublicId,
        user: savedUser, // Link to the user
        isVerified: false,
      });

      const savedOrganization = await queryRunner.manager.save(organization);

      // Commit the transaction
      await queryRunner.commitTransaction();
      this.logger.log(`Organization and User created successfully. Org ID: ${savedOrganization.id}`);

      return {
        success: true,
        message: 'Organization registered successfully. Please wait for verification.',
        data: {
          id: savedOrganization.id,
          organizationName: savedOrganization.organizationName,
          emailAddress: user.email,
          registrationNumber: savedOrganization.registrationNumber,
          isVerified: savedOrganization.isVerified,
          createdAt: savedOrganization.createdAt,
        },
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      throw new BadRequestException('Organization registration failed. Please check your data.');
    } finally {
      // Release the query runner
      await queryRunner.release();
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