import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/user/entity/user.entity';
import { UserService } from 'src/modules/user/user.service';



@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates a user's password.
   * @param email - User's email.
   * @param pass - Plain text password.
   * @returns The user object without the password if credentials are valid, otherwise null.
   */
  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await user.validatePassword(pass))) {
      // Remove password property before returning
      delete (user as any).password;
      return user;
    }
    return null;
  }

  /**
   * Handles the login process.
   * @param user - A user object, typically from a validated passport strategy.
   * @returns An access token.
   * @throws UnauthorizedException if the user is not verified.
   */
  async login(user: User) {
    if (!user.isVerified) {
      this.logger.warn(`Login attempt for unverified user: ${user.email}`);
      throw new UnauthorizedException('Your account has not been verified by an administrator yet.');
    }

    const payload = { email: user.email, sub: user.id, role: user.role , organization :user.organization?.id};
    this.logger.log(`User logged in successfully: ${user.email}`);

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}