import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'modern-erp-api',
      version: '0.1.0',
    };
  }

  @Public()
  @Get('ready')
  ready() {
    return { status: 'ready' };
  }

  @Public()
  @Get('live')
  live() {
    return { status: 'live' };
  }
}
