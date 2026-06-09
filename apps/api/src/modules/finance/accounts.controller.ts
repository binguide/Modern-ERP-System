import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto, QueryAccountsDto } from './dto/account.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@Body() dto: CreateAccountDto, @CurrentUser('companyId') companyId: string) {
    return this.accountsService.create(dto, companyId);
  }

  @Get()
  findAll(@CurrentUser('companyId') companyId: string, @Query() query?: QueryAccountsDto) {
    return this.accountsService.findAll(companyId, query);
  }

  @Get('tree')
  findTree(@CurrentUser('companyId') companyId: string) {
    return this.accountsService.findTree(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.accountsService.findById(id, companyId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.accountsService.update(id, dto, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.accountsService.remove(id, companyId);
  }
}
