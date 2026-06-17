import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetCategory } from './entities/asset-category.entity';
import { FixedAsset } from './entities/fixed-asset.entity';
import { AssetCategoriesController } from './asset-categories.controller';
import { AssetCategoriesService } from './asset-categories.service';
import { FixedAssetsController } from './fixed-assets.controller';
import { FixedAssetsService } from './fixed-assets.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssetCategory, FixedAsset])],
  controllers: [AssetCategoriesController, FixedAssetsController],
  providers: [AssetCategoriesService, FixedAssetsService],
  exports: [TypeOrmModule],
})
export class FixedAssetsModule {}
