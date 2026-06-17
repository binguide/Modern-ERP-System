import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderLine } from './entities/purchase-order-line.entity';
import { PurchaseReceipt } from './entities/purchase-receipt.entity';
import { PurchaseReceiptLine } from './entities/purchase-receipt-line.entity';
import { PurchaseInvoice } from './entities/purchase-invoice.entity';
import { PurchaseInvoiceLine } from './entities/purchase-invoice-line.entity';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseReceiptsController } from './purchase-receipts.controller';
import { PurchaseReceiptsService } from './purchase-receipts.service';
import { PurchaseInvoicesController } from './purchase-invoices.controller';
import { PurchaseInvoicesService } from './purchase-invoices.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Supplier,
      PurchaseOrder,
      PurchaseOrderLine,
      PurchaseReceipt,
      PurchaseReceiptLine,
      PurchaseInvoice,
      PurchaseInvoiceLine,
    ]),
  ],
  controllers: [
    SuppliersController,
    PurchaseOrdersController,
    PurchaseReceiptsController,
    PurchaseInvoicesController,
  ],
  providers: [
    SuppliersService,
    PurchaseOrdersService,
    PurchaseReceiptsService,
    PurchaseInvoicesService,
  ],
  exports: [TypeOrmModule],
})
export class PurchasesModule {}
