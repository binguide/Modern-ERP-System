import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
}));

export const securityConfig = registerAs('security', () => ({
  bcryptCost: parseInt(process.env.BCRYPT_COST ?? '12', 10),
  throttleTtl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
}));
