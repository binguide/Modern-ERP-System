import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SalesInvoicesService } from './sales-invoices.service';
import {
  CreateSalesInvoiceDto,
  UpdateSalesInvoiceDto,
  QuerySalesInvoicesDto,
} from './dto/sales-invoice.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('sales-invoices')
export class SalesInvoicesController {
  constructor(private readonly service: SalesInvoicesService) {}

  @Post()
  create(@Body() dto: CreateSalesInvoiceDto, @CurrentUser('companyId') companyId: string) {
    return this.service.create(dto, companyId);
  }

  @Get()
  findAll(@CurrentUser('companyId') companyId: string, @Query() query?: QuerySalesInvoicesDto) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.findById(id, companyId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSalesInvoiceDto,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.service.update(id, dto, companyId);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.submit(id, companyId);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.cancel(id, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.remove(id, companyId);
  }
}
