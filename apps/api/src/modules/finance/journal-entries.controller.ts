import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JournalEntriesService } from './journal-entries.service';
import {
  CreateJournalEntryDto,
  UpdateJournalEntryDto,
  QueryJournalEntryDto,
} from './dto/journal-entry.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('journal-entries')
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  create(@Body() dto: CreateJournalEntryDto, @CurrentUser() user: any) {
    return this.journalEntriesService.create(dto, user.companyId, user.sub);
  }

  @Get()
  findAll(@CurrentUser('companyId') companyId: string, @Query() query?: QueryJournalEntryDto) {
    return this.journalEntriesService.findAll(companyId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.journalEntriesService.findById(id, companyId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJournalEntryDto,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.journalEntriesService.update(id, dto, companyId);
  }

  @Post(':id/post')
  post(@Param('id') id: string, @CurrentUser() user: any) {
    return this.journalEntriesService.post(id, user.companyId, user.sub);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.journalEntriesService.cancel(id, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.journalEntriesService.remove(id, companyId);
  }
}
