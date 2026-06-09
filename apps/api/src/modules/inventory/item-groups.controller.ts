import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ItemGroupsService } from './item-groups.service';
import { CreateItemGroupDto, UpdateItemGroupDto, QueryItemGroupsDto } from './dto/item-group.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('item-groups')
export class ItemGroupsController {
  constructor(private readonly service: ItemGroupsService) {}

  @Post()
  create(@Body() dto: CreateItemGroupDto, @CurrentUser('companyId') companyId: string) {
    return this.service.create(dto, companyId);
  }

  @Get()
  findAll(@CurrentUser('companyId') companyId: string, @Query() query?: QueryItemGroupsDto) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.findById(id, companyId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateItemGroupDto,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.service.update(id, dto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.service.remove(id, companyId);
  }
}
