import { Controller, Post, UseGuards, Request, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/config/guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/modules/user/entity/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Logs a user in and returns a JWT
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful, returns JWT token.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials or unverified account.' })
  async login(@Request() req: { user: User }) {
    return this.authService.login(req.user);
  }
}