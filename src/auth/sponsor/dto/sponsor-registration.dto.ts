import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsUrl,
  IsNumber,
  IsArray,
  IsEnum,
  IsOptional,
  Min,
  Max,
  ArrayNotEmpty,
  ArrayMinSize,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Sector, CompanyType } from 'src/common/enums';
import { IsPhone } from 'src/common/validators/is-phone.validator';
import { PasswordDto } from 'src/auth/dto/password.dto';
import { Transform } from 'class-transformer';

/**
 * Data Transfer Object for Sponsor Registration
 * Contains all required fields and validation rules for sponsor registration
 */
export class SponsorRegistrationDto extends PasswordDto {
  @ApiProperty({ description: 'Name of the sponsoring company', example: 'Nepal Investment Bank Ltd.', minLength: 2, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  companyName: string;

  @ApiProperty({ description: 'Type of the company', example: CompanyType.PRIVATE, enum: CompanyType })
  @IsEnum(CompanyType, { message: 'Company type must be a valid type' })
  @IsNotEmpty()
  companyType: CompanyType;

  @ApiProperty({ description: 'Year the company was established', example: 2001 })
  @IsNumber({}, { message: 'Year of establishment must be a number' })
  @Type(() => Number)
  @Min(1500, { message: 'Year of establishment seems too old' })
  @Max(new Date().getFullYear(), { message: 'Year of establishment cannot be in the future' })
  yearsOfEstablishment: number;

  @ApiProperty({ description: 'Official registration number of the company', example: 'COMP-2024-001234', minLength: 4, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(50)
  registrationNumber: string;

  @ApiProperty({ description: 'Official email address of the company', example: 'corporate@nibl.com.np', format: 'email' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  emailAddress: string;

  @ApiProperty({ description: 'Primary phone number of the company', example: '+977-01-4567890', pattern: '^[+]?[0-9]{10,15}$' })
  @IsPhone()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ description: 'Complete address of the company', example: 'Durbar Marg, Kathmandu Metropolitan City, Kathmandu', minLength: 10, maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  companyAddress: string;

  @ApiProperty({ description: 'Official website URL of the company', example: 'https://www.nibl.com.np', format: 'url' })
  @IsUrl({}, { message: 'Company website must be a valid URL' })
  @IsNotEmpty()
  companyWebsite: string;

  @ApiProperty({ description: 'Sectors that the company works in', example: [Sector.TECHNOLOGY, Sector.HEALTH], enum: Sector, isArray: true })
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map(item => item.trim()) : value))
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one work sector must be selected' })
  @ArrayMinSize(1)
  @IsEnum(Sector, { each: true, message: 'Each work sector must be a valid sector type' })
  sectorsOfWork: Sector[];

  @ApiPropertyOptional({ description: 'Additional work sectors not listed. Required if "Others" is selected.', example: 'Financial Services', maxLength: 100 })
  @ValidateIf((o) => o.sectorsOfWork?.includes(Sector.OTHERS))
  @IsNotEmpty({ message: 'Other work sectors cannot be empty when "Others" is selected' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  otherWorkSectors?: string;

  @ApiProperty({ description: 'Sectors the company is interested in sponsoring', example: [Sector.EDUCATION, Sector.ENVIRONMENT], enum: Sector, isArray: true })
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map(item => item.trim()) : value))
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one sponsorship sector must be selected' })
  @ArrayMinSize(1)
  @IsEnum(Sector, { each: true, message: 'Each sponsorship sector must be a valid sector type' })
  sectorsInterestedToSponsor: Sector[];

  @ApiPropertyOptional({ description: 'Additional sponsorship sectors not listed. Required if "Others" is selected.', example: 'Sports Development', maxLength: 100 })
  @ValidateIf((o) => o.sectorsInterestedToSponsor?.includes(Sector.OTHERS))
  @IsNotEmpty({ message: 'Other sponsorship sectors cannot be empty when "Others" is selected' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  otherSponsorshipSectors?: string;

  @ApiProperty({
    description: 'Company logo file (JPG, PNG). Required.',
    type: 'string',
    format: 'binary',
  })
  companyLogo: Express.Multer.File;

  @ApiProperty({
    description: 'Company registration certificate (PDF, JPG, PNG). Required.',
    type: 'string',
    format: 'binary',
  })
  registrationCertificate: Express.Multer.File;
}