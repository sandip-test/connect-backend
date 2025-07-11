import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';

export class PasswordDto {
  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak. It must contain upper, lower, number or a special character',
  })
  password: string;
}