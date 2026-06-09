import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PeriodsService } from './periods.service';
import { CreatePeriodDto, UpdatePeriodDto, QueryPeriodsDto } from './dto/fiscal-year.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Post()
  create(@Body() dto: CreatePeriodDto, @CurrentUser('companyId') companyId: string) {
    return this.periodsService.create(dto, companyId);
  }

  @Get()
  findAll(@CurrentUser('companyId') companyId: string, @Query() query?: QueryPeriodsDto) {
    return this.periodsService.findAll(companyId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.periodsService.findById(id, companyId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePeriodDto,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.periodsService.update(id, dto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.periodsService.remove(id, companyId);
  }
}
