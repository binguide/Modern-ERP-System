import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-min-32-chars-long',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-min-32-chars-long',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
}));
