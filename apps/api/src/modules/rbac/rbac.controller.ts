import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('roles')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Post()
  create(@Body() dto: CreateRoleDto, @CurrentUser('companyId') companyId: string) {
    return this.rbacService.create(dto, companyId);
  }

  @Get()
  findAll(@Query() query: QueryRoleDto, @CurrentUser('companyId') companyId: string) {
    return this.rbacService.findAll(query, companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.rbacService.findById(id, companyId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.rbacService.update(id, dto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.rbacService.remove(id, companyId);
  }
}
