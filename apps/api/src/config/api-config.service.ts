import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiConfigService {
  constructor(private config: ConfigService) {}

  get nodeEnv(): string {
    return this.config.get<string>('app.nodeEnv', 'development');
  }

  get port(): number {
    return this.config.get<number>('app.port', 3000);
  }

  get database() {
    return {
      host: this.config.getOrThrow<string>('database.host'),
      port: this.config.getOrThrow<number>('database.port'),
      username: this.config.getOrThrow<string>('database.username'),
      password: this.config.getOrThrow<string>('database.password'),
      database: this.config.getOrThrow<string>('database.database'),
      synchronize: this.config.get<string>('database.synchronize', 'false') === 'true',
      logging: this.config.get<string>('database.logging', 'false') === 'true',
    };
  }

  get redis() {
    return {
      host: this.config.getOrThrow<string>('redis.host'),
      port: this.config.getOrThrow<number>('redis.port'),
      password: this.config.get<string>('redis.password') || undefined,
    };
  }

  get jwt() {
    return {
      accessSecret: this.config.getOrThrow<string>('jwt.accessSecret'),
      accessExpiresIn: this.config.get<string>('jwt.accessExpiresIn', '15m'),
      refreshSecret: this.config.getOrThrow<string>('jwt.refreshSecret'),
      refreshExpiresIn: this.config.get<string>('jwt.refreshExpiresIn', '7d'),
    };
  }

  get bcryptCost(): number {
    return this.config.get<number>('security.bcryptCost', 12);
  }
}
