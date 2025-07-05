import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  HttpStatus,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SponsorRegistrationDto } from './dto/sponsor-registration.dto';
import { SponsorRegistrationService } from './sponsor.service';
import { RegistrationResponse } from 'src/common/interfaces/registration-response.interface';
import { ApiFile } from '../../common/decorators/api-file.decorator';

/**
 * Controller handling sponsor registration endpoints
 * Provides REST APIs for sponsor registration and management
 */
@ApiTags('Sponsor Registration')
@Controller('auth/sponsor')
export class SponsorRegistrationController {
  constructor(
    private readonly sponsorRegistrationService: SponsorRegistrationService,
  ) {}

  /**
   * Registers a new sponsor
   * @param dto Sponsor registration data
   * @param files Uploaded files (logo and certificate)
   * @returns Promise<RegistrationResponse> Registration result
   */
  @Post('register')
  @ApiOperation({
    summary: 'Register a new sponsor',
    description: 'Registers a new sponsor with file uploads for logo and certificate',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Sponsor registration data with file uploads',
    type: SponsorRegistrationDto,
  })
  @ApiFile('companyLogo', true, 'Company logo (JPG, PNG, max 5MB)')
  @ApiFile('registrationCertificate', true, 'Registration certificate (PDF, JPG, PNG, max 10MB)')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sponsor registered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Sponsor registered successfully. Please wait for verification.' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
            companyName: { type: 'string', example: 'Nepal Investment Bank Ltd.' },
            emailAddress: { type: 'string', example: 'corporate@nibl.com.np' },
            registrationNumber: { type: 'string', example: 'COMP-2024-001234' },
            isVerified: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or file upload failed',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Sponsor already exists',
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'companyLogo', maxCount: 1 },
      { name: 'registrationCertificate', maxCount: 1 },
    ]),
  )
  async registerSponsor(
    @Body() dto: SponsorRegistrationDto,
    @UploadedFiles()
    files: {
      companyLogo: Express.Multer.File[];
      registrationCertificate: Express.Multer.File[];
    },
  ): Promise<RegistrationResponse> {
    // Validate file uploads
    if (!files?.companyLogo?.[0] || !files?.registrationCertificate?.[0]) {
      throw new BadRequestException('Both company logo and registration certificate are required');
    }

    return this.sponsorRegistrationService.registerSponsor(dto, {
      companyLogo: files.companyLogo[0],
      registrationCertificate: files.registrationCertificate[0],
    });
  }

  /**
   * Retrieves sponsor by ID
   * @param id Sponsor ID
   * @returns Promise<Sponsor> Sponsor details
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get sponsor by ID',
    description: 'Retrieves sponsor details by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Sponsor UUID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sponsor retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sponsor not found',
  })
  async getSponsorById(@Param('id', ParseUUIDPipe) id: string) {
    return this.sponsorRegistrationService.getSponsorById(id);
  }

  /**
   * Retrieves all sponsors with pagination
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @returns Promise<{sponsors: Sponsor[], total: number, page: number, limit: number}>
   */
  @Get()
  @ApiOperation({
    summary: 'Get all sponsors',
    description: 'Retrieves all sponsors with pagination support',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    type: 'number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    type: 'number',
    required: false,
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sponsors retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        sponsors: {
          type: 'array',
          items: { type: 'object' },
        },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 10 },
      },
    },
  })
  async getAllSponsors(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.sponsorRegistrationService.getAllSponsors(page, limit);
  }
}