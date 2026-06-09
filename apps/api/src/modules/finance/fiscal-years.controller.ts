import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FiscalYearsService } from './fiscal-years.service';
import {
  CreateFiscalYearDto,
  UpdateFiscalYearDto,
  QueryFiscalYearsDto,
} from './dto/fiscal-year.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('fiscal-years')
export class FiscalYearsController {
  constructor(private readonly fiscalYearsService: FiscalYearsService) {}

  @Post()
  create(@Body() dto: CreateFiscalYearDto, @CurrentUser('companyId') companyId: string) {
    return this.fiscalYearsService.create(dto, companyId);
  }

  @Get()
  findAll(@CurrentUser('companyId') companyId: string, @Query() query?: QueryFiscalYearsDto) {
    return this.fiscalYearsService.findAll(companyId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.fiscalYearsService.findById(id, companyId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFiscalYearDto,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.fiscalYearsService.update(id, dto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.fiscalYearsService.remove(id, companyId);
  }
}
