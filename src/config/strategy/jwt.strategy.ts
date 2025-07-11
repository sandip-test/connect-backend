import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  // Passport automatically verifies the token's signature and expiration
  // This method is called only if the token is valid
  async validate(payload: { sub: string; email: string; role: string }) {
    // The payload is what we put into it in the auth.service login method
    // This return value is what will be attached to the request object as `req.user`
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}