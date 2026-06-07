import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  name: process.env.APP_NAME ?? 'Modern ERP API',
  url: process.env.APP_URL ?? 'http://localhost:3000',
  webUrl: process.env.WEB_URL ?? 'http://localhost:5173',
}));
