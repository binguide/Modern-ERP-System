import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { Item } from './entities/item.entity';
import { UnitOfMeasure } from './entities/unit-of-measure.entity';
import { ItemGroup } from './entities/item-group.entity';
import { ItemUnit } from './entities/item-unit.entity';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from './warehouses.service';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { UnitsOfMeasureController } from './units-of-measure.controller';
import { UnitsOfMeasureService } from './units-of-measure.service';
import { ItemGroupsController } from './item-groups.controller';
import { ItemGroupsService } from './item-groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, Item, UnitOfMeasure, ItemGroup, ItemUnit])],
  controllers: [
    WarehousesController,
    ItemsController,
    UnitsOfMeasureController,
    ItemGroupsController,
  ],
  providers: [WarehousesService, ItemsService, UnitsOfMeasureService, ItemGroupsService],
  exports: [TypeOrmModule],
})
export class InventoryModule {}
