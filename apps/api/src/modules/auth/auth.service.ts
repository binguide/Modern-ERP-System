import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase().trim() } as any,
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.permissions'],
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is inactive');
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is locked. Try again later.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.userRepo.increment({ id: user.id } as any, 'failedLoginCount', 1);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.userRepo.update(user.id, {
      failedLoginCount: 0,
      lockedUntil: null as any,
      lastLoginAt: new Date(),
    });

    return this.generateTokens(user, ipAddress, userAgent);
  }

  async refresh(refreshTokenStr: string, ipAddress?: string, userAgent?: string) {
    const token = await this.refreshTokenRepo.findOne({
      where: { token: refreshTokenStr } as any,
      relations: [
        'user',
        'user.userRoles',
        'user.userRoles.role',
        'user.userRoles.role.permissions',
      ],
    });

    if (!token || token.revokedAt || token.expiresAt < new Date()) {
      if (token) {
        await this.refreshTokenRepo.update(token.id, { revokedAt: new Date() });
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepo.update(token.id, { revokedAt: new Date() });

    return this.generateTokens(token.user!, ipAddress, userAgent);
  }

  async logout(userId: string) {
    await this.refreshTokenRepo.update(
      { userId, revokedAt: undefined } as any,
      { revokedAt: new Date() } as any,
    );
  }

  async me(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId } as any,
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.permissions', 'branch'],
    });
    if (!user) throw new UnauthorizedException('User not found');
    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } as any });
    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepo.update(user.id, { passwordHash });

    await this.refreshTokenRepo.update(
      { userId, revokedAt: undefined } as any,
      { revokedAt: new Date() } as any,
    );

    return { message: 'Password changed successfully' };
  }

  private async generateTokens(user: User, ipAddress?: string, userAgent?: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      isSuperAdmin: user.isSuperAdmin,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshTokenStr = randomUUID();

    await this.refreshTokenRepo.save({
      userId: user.id,
      token: refreshTokenStr,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo: userAgent,
      ipAddress,
    } as any);

    return {
      accessToken,
      refreshToken: refreshTokenStr,
      user: this.sanitizeUser(user),
    };
  }

  private sanitizeUser(user: User) {
    const u = { ...user } as any;
    delete u.passwordHash;
    return {
      ...u,
      roles:
        (user as any).userRoles?.map((ur: any) => ({
          id: ur.role?.id,
          code: ur.role?.code,
          name: ur.role?.name,
          permissions:
            ur.role?.permissions?.map((rp: any) => ({
              resource: rp.resource,
              action: rp.action,
              scope: rp.scope,
            })) || [],
        })) || [],
    };
  }
}
