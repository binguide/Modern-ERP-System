import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { SalesOrder } from './entities/sales-order.entity';
import { SalesOrderLine } from './entities/sales-order-line.entity';
import { SalesInvoice } from './entities/sales-invoice.entity';
import { SalesInvoiceLine } from './entities/sales-invoice-line.entity';
import { DeliveryNote } from './entities/delivery-note.entity';
import { DeliveryNoteLine } from './entities/delivery-note-line.entity';
import { Quotation } from './entities/quotation.entity';
import { QuotationLine } from './entities/quotation-line.entity';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersService } from './sales-orders.service';
import { SalesInvoicesController } from './sales-invoices.controller';
import { SalesInvoicesService } from './sales-invoices.service';
import { DeliveryNotesController } from './delivery-notes.controller';
import { DeliveryNotesService } from './delivery-notes.service';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      SalesOrder,
      SalesOrderLine,
      SalesInvoice,
      SalesInvoiceLine,
      DeliveryNote,
      DeliveryNoteLine,
      Quotation,
      QuotationLine,
    ]),
  ],
  controllers: [
    CustomersController,
    SalesOrdersController,
    SalesInvoicesController,
    DeliveryNotesController,
    QuotationsController,
  ],
  providers: [
    CustomersService,
    SalesOrdersService,
    SalesInvoicesService,
    DeliveryNotesService,
    QuotationsService,
  ],
  exports: [TypeOrmModule],
})
export class SalesModule {}
