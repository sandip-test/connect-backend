import { IsString, IsNotEmpty, IsDate, IsEnum, IsNumber, IsOptional, IsUUID, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { Sector } from '../../../common/enums';
import { EventType } from '../../../common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'Name of the event',
    example: 'Tech Conference 2023',
    minLength: 2,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Event name must be at least 2 characters long.' })
  @MaxLength(500, { message: 'Event name must not exceed 500 characters.' })
  name: string;

  @ApiProperty({
    description: 'Description of the event',
    example: 'An annual conference for tech enthusiasts.',
    minLength: 10,
    maxLength: 2000,
  })
  @MinLength(10, { message: 'Description must be at least 10 characters long.' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Venue of the event',
    example: 'Tech Park Auditorium',
    minLength: 2,
    maxLength: 255,
  })
  @MinLength(2, { message: 'Venue must be at least 2 characters long.' })
  @MaxLength(255, { message: 'Venue must not exceed 255 characters.' })
  @IsString()
  @IsNotEmpty()
  venue: string;

  @ApiProperty({
    description: 'Date of the event',
    example: '2023-10-01T10:00:00Z',
  })
  @IsDate()
  @Type(() => Date) // Transform string to Date
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    description: 'Category of the event',
    example: 'Technology',
    enum: Sector,
    default: Sector.OTHERS,
  })
  @IsEnum(Sector)
  @IsOptional()
  category?: Sector = Sector.OTHERS;

  @ApiProperty({
    description: 'Type of the event',
    example: 'In-person',
    enum: EventType,
    default: EventType.INPERSON,
  })                                                                                        
  @IsEnum(EventType)
  @IsOptional()
  eventType?: EventType = EventType.INPERSON;

  @ApiProperty({
    description: 'Expected number of attendees',
    example: 100,
    default: 100,
  })
  @IsNumber()
  @IsOptional()                                                                                                           
  attendeesCount?: number = 100;

  @ApiProperty({
    description: 'Start date of the event',
    example: '2024-10-01T09:00:00Z',
  })
  @IsDate()
  @Type(() => Date) // Transform string to Date
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: 'End date of the event',
    example: '2025-10-01T17:00:00Z',
  })
  @IsDate()
  @Type(() => Date) // Transform string to Date
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({
    description: 'State of the event',
    example: 'Scheduled',
    minLength: 2,
    maxLength: 50,
  })
  @MinLength(2, { message: 'State must be at least 2 characters long.' })
  @MaxLength(50, { message: 'State must not exceed 50 characters.' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Organization ID associated with the event',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  organization: string; // foreign key reference
}