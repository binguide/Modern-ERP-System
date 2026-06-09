import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TaxesService } from './taxes.service';
import { CreateTaxDto, UpdateTaxDto, QueryTaxesDto } from './dto/tax.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('taxes')
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
  create(@Body() dto: CreateTaxDto, @CurrentUser('companyId') companyId: string) {
    return this.taxesService.create(dto, companyId);
  }

  @Get()
  findAll(@CurrentUser('companyId') companyId: string, @Query() query?: QueryTaxesDto) {
    return this.taxesService.findAll(companyId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.taxesService.findById(id, companyId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaxDto,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.taxesService.update(id, dto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.taxesService.remove(id, companyId);
  }
}
