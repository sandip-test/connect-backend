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
  Patch,
  UseGuards,
  Request,
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
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/config/guards/jwt-auth.guard';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

/**
 * Controller handling sponsor registration endpoints
 * Provides REST APIs for sponsor registration and management
 */
@ApiTags('Sponsor Registration')
@Controller('auth/sponsor')
export class SponsorRegistrationController {
  constructor(
    private readonly sponsorRegistrationService: SponsorRegistrationService,
  ) { }

  /**
   * Registers a new sponsor
   * @param dto Sponsor registration data
   * @param files Uploaded files (logo and certificate)
   * @returns Promise<RegistrationResponse> Registration result
   */
  @Post('register')
  @ApiOperation({ summary: 'Register a new sponsor' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SponsorRegistrationDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Sponsor registered successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data or file upload failed.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Sponsor with this email or registration number already exists.' })
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
      companyLogo?: Express.Multer.File[];
      registrationCertificate?: Express.Multer.File[];
    },
  ): Promise<RegistrationResponse> {
    const companyLogo = files?.companyLogo?.[0];
    const registrationCertificate = files?.registrationCertificate?.[0];

    if (!companyLogo || !registrationCertificate) {
      throw new BadRequestException('Both company logo and registration certificate files are required.');
    }

    return this.sponsorRegistrationService.registerSponsor(dto, {
      companyLogo,
      registrationCertificate,
    });
  }

  /**
   * Retrieves sponsor by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get sponsor by ID' })
  @ApiParam({ name: 'id', description: 'Sponsor UUID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sponsor retrieved successfully.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sponsor not found.' }) // Aligned with service exception
  async getSponsorById(@Param('id', ParseUUIDPipe) id: string) {
    return this.sponsorRegistrationService.getSponsorById(id);
  }

  /**
   * Retrieves all sponsors with pagination
   */
  @Get()
  @ApiOperation({ summary: 'Get all sponsors' })
  @ApiQuery({ name: 'page', type: 'number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: 'number', required: false, example: 10 })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sponsors retrieved successfully.' })
  async getAllSponsors(
    @Query('page', new ParseIntPipe({ optional: true, exceptionFactory: () => new BadRequestException('Page must be a number') })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true, exceptionFactory: () => new BadRequestException('Limit must be a number') })) limit: number = 10,
  ) {
    return this.sponsorRegistrationService.getAllSponsors(page > 0 ? page : 1, limit > 0 ? limit : 10);
  }

  /**
   * Updates an existing sponsor's profile
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a sponsor profile' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Sponsor updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Sponsor not found.' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'companyLogo', maxCount: 1 },
      { name: 'registrationCertificate', maxCount: 1 },
    ]),
  )
  async updateSponsor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSponsorDto,
    @Request() req: any,
    @UploadedFiles() files: {
      companyLogo?: Express.Multer.File[];
      registrationCertificate?: Express.Multer.File[];
    },
  ) {
    const companyLogo = files?.companyLogo?.[0];
    const registrationCertificate = files?.registrationCertificate?.[0];

    return this.sponsorRegistrationService.updateSponsor(id, dto, req.user, {
      companyLogo,
      registrationCertificate,
    });
  }
}