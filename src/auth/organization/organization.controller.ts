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
import { OrganizationRegistrationService } from './organization.service';
import { OrganizationRegistrationDto } from './dto/organization-registration.dto';
import { RegistrationResponse } from 'src/common/interfaces/registration-response.interface';
import { ApiFile } from '../../common/decorators/api-file.decorator';

/**
 * Controller handling organization registration endpoints
 * Provides REST APIs for organization registration and management
 */
@ApiTags('Organization Registration')
@Controller('auth/organization')
export class OrganizationRegistrationController {
  constructor(
    private readonly organizationRegistrationService: OrganizationRegistrationService,
  ) { }

  /**
   * Registers a new organization
   * @param dto Organization registration data
   * @param files Uploaded files (logo and certificate)
   * @returns Promise<RegistrationResponse> Registration result
   */
  @Post('register')
  @ApiOperation({
    summary: 'Register a new organization',
    description: 'Registers a new organization with file uploads for logo and certificate',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Organization registration data with file uploads',
    type: OrganizationRegistrationDto, // Note: For Swagger UI, file properties should be on the DTO.
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Organization registered successfully',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data or file upload failed' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Organization already exists' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'organizationLogo', maxCount: 1 },
      { name: 'registrationCertificate', maxCount: 1 },
    ]),
  )
  async registerOrganization(
    @Body() dto: OrganizationRegistrationDto,
    @UploadedFiles()
    files: {
      organizationLogo?: Express.Multer.File[];
      registrationCertificate?: Express.Multer.File[];
    },
  ): Promise<RegistrationResponse> {
    const organizationLogo = files?.organizationLogo?.[0];
    const registrationCertificate = files?.registrationCertificate?.[0];

    // Robust check for both required files
    if (!organizationLogo || !registrationCertificate) {
      throw new BadRequestException('Both organization logo and registration certificate files are required.');
    }

    return this.organizationRegistrationService.registerOrganization(dto, {
      organizationLogo,
      registrationCertificate,
    });
  }

  /**
   * Retrieves organization by ID
   * @param id Organization ID
   * @returns Promise<Organization> Organization details
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get organization by ID',
    description: 'Retrieves organization details by its unique identifier',
  })
  @ApiParam({ name: 'id', description: 'Organization UUID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Organization retrieved successfully' })
  // FIX: Changed status to NOT_FOUND for semantic accuracy
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Organization not found' })
  async getOrganizationById(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationRegistrationService.getOrganizationById(id);
  }
  /**
   * Retrieves all organizations with pagination
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @returns Promise<{organizations: Organization[], total: number, page: number, limit: number}>
   */
  @Get()
  @ApiOperation({
    summary: 'Get all organizations',
    description: 'Retrieves all organizations with pagination support',
  })
  @ApiQuery({ name: 'page', type: 'number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: 'number', required: false, example: 10 })
  @ApiResponse({ status: HttpStatus.OK, description: 'Organizations retrieved successfully' })
  async getAllOrganizations(
    @Query('page', new ParseIntPipe({ optional: true, exceptionFactory: () => new BadRequestException('Page must be a number') })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true, exceptionFactory: () => new BadRequestException('Limit must be a number') })) limit: number = 10,
  ) {
    return this.organizationRegistrationService.getAllOrganizations(page > 0 ? page : 1, limit > 0 ? limit : 10);
  }
}