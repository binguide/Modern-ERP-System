import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UnitsOfMeasureService } from './units-of-measure.service';
import {
  CreateUnitOfMeasureDto,
  UpdateUnitOfMeasureDto,
  QueryUnitsOfMeasureDto,
} from './dto/unit-of-measure.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('units-of-measure')
export class UnitsOfMeasureController {
  constructor(private readonly service: UnitsOfMeasureService) {}

  @Post()
  create(@Body() dto: CreateUnitOfMeasureDto, @CurrentUser('companyId') companyId: string) {
    return this.service.create(dto, companyId);
  }

  @Get()
  findAll(@CurrentUser('companyId') companyId: string, @Query() query?: QueryUnitsOfMeasureDto) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.findById(id, companyId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUnitOfMeasureDto,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.service.update(id, dto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.remove(id, companyId);
  }
}
