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
  MinLength
} from 'class-validator';
import { Type } from 'class-transformer';
import { Sector , BranchType } from 'src/common/enums';
import { IsPhone } from 'src/common/validators/is-phone.validator';

/**
 * Data Transfer Object for Organization Registration
 * Contains all required fields and validation rules for organization registration
 */
export class OrganizationRegistrationDto {
  @ApiProperty({
    description: 'Name of the organization',
    example: 'Sayapatri Group',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  organizationName: string;

  @ApiProperty({
    description: 'Official website URL of the organization',
    example: 'https://www.cyberalertnepal.com',
    format: 'url'
  })
  @IsUrl({}, { message: 'Organization website must be a valid URL' })
  @IsNotEmpty()
  organizationWebsite: string;

  @ApiProperty({
    description: 'Full name of the organization head/CEO',
    example: 'Mr. xyz',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  headOfOrganization: string;

  @ApiProperty({
    description: 'Contact number of the organization head',
    example: '+977-9841234567',
    pattern: '^[+]?[0-9]{10,15}$'
  })
  @IsPhone()
  @IsNotEmpty()
  headContactNumber: string;

  @ApiProperty({
    description: 'Years of Established',
    example: 2001,
  })
  @IsNumber({}, { message: 'Years of establishment must be a number' })
  @Type(() => Number)
  yearsOfEstablishment: number;

  @ApiProperty({
    description: 'Official registration number of the organization',
    example: 'REG-2024-001234',
    minLength: 5,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  registrationNumber: string;

  @ApiProperty({
    description: 'Official email address of the organization',
    example: 'info@xyz.com.np',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  emailAddress: string;

  @ApiProperty({
    description: 'Sectors that the organization works in',
    example: [Sector.TECHNOLOGY, Sector.EDUCATION],
    enum: Sector,
    isArray: true,
    type: [String]
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one sector must be selected' })
  @ArrayMinSize(1)
  @IsEnum(Sector, { each: true, message: 'Each sector must be a valid sector type' })
  sectorsYouWorkIn: Sector[];

  @ApiPropertyOptional({
    description: 'Additional sectors not listed in predefined options',
    example: 'Renewable Energy',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  otherSectors?: string;

  @ApiProperty({
    description: 'Primary phone number of the organization',
    example: '+977-01-4567890',
    pattern: '^[+]?[0-9]{10,15}$'
  })
  @IsPhone()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Complete address of the organization',
    example: 'Kathmandu Metropolitan City, Ward No. 10, Bagbazar, Kathmandu',
    minLength: 5,
    maxLength: 200
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  address: string;

  @ApiProperty({
    description: 'Whether this is a main office or branch office',
    example: BranchType.MAIN,
    enum: BranchType
  })
  @IsEnum(BranchType, { message: 'Branch type must be either Main or Branch' })
  @IsNotEmpty()
  branchOrMain: BranchType;

  @ApiProperty({
    description: 'Geographic location of the organization',
    example: 'Kathmandu, Nepal',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  location: string;

  @ApiProperty({
    description: 'Organization logo file (image format)',
    type: 'string',
    format: 'binary'
  })
  organizationLogo: Express.Multer.File;

  @ApiProperty({
    description: 'Organization registration certificate (PDF or image)',
    type: 'string',
    format: 'binary'
  })
  registrationCertificate: Express.Multer.File;
}