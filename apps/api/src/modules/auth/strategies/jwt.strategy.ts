import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    companyId: string;
    isSuperAdmin: boolean;
  }) {
    const user = await this.userRepo.findOne({
      where: { id: payload.sub, isActive: true } as any,
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.permissions'],
    });
    if (!user) throw new UnauthorizedException('User not found or inactive');

    const userRoles = (user as any).userRoles as any[] | undefined;
    const permissions =
      userRoles
        ?.flatMap((ur: any) => ur.role?.permissions ?? [])
        .map((rp: any) => ({
          resource: rp.resource,
          action: rp.action,
          scope: rp.scope,
        })) ?? [];

    return {
      sub: payload.sub,
      email: payload.email,
      companyId: payload.companyId,
      isSuperAdmin: payload.isSuperAdmin,
      permissions,
    };
  }
}
