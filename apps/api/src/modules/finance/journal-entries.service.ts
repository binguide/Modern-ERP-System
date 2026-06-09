import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JournalEntry, JournalEntryStatus } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { Account } from './entities/account.entity';
import {
  CreateJournalEntryDto,
  UpdateJournalEntryDto,
  QueryJournalEntryDto,
} from './dto/journal-entry.dto';

@Injectable()
export class JournalEntriesService {
  constructor(
    @InjectRepository(JournalEntry)
    private readonly jeRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private readonly jelRepo: Repository<JournalEntryLine>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateJournalEntryDto, companyId: string, userId: string) {
    if (!dto.lines || dto.lines.length < 2) {
      throw new BadRequestException('Journal entry must have at least 2 lines');
    }

    const totalDebit = dto.lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = dto.lines.reduce((sum, l) => sum + l.credit, 0);

    if (totalDebit !== totalCredit) {
      throw new BadRequestException('Total debit must equal total credit');
    }

    // Validate accounts exist
    const accountIds = dto.lines.map((l) => l.accountId);
    const accounts = await this.accountRepo.findByIds(accountIds);
    if (accounts.length !== accountIds.length) {
      throw new NotFoundException('One or more accounts not found');
    }

    // Get next number
    const maxResult = await this.jeRepo
      .createQueryBuilder('je')
      .select('COALESCE(MAX(je.number), 0)', 'max')
      .where('je.companyId = :companyId', { companyId })
      .getRawOne();
    const nextNumber = (Number(maxResult?.max) || 0) + 1;

    const entryData: any = {
      number: nextNumber,
      date: dto.date,
      description: dto.description,
      fiscalYearId: dto.fiscalYearId,
      periodId: dto.periodId,
      reference: dto.reference,
      companyId,
      createdBy: userId,
      status: JournalEntryStatus.DRAFT,
      totalDebit,
      totalCredit,
    };

    const saved = (await this.jeRepo.save(entryData)) as any;

    const linesData = dto.lines.map((l) => ({
      journalEntryId: saved.id,
      accountId: l.accountId,
      description: l.description,
      debit: l.debit,
      credit: l.credit,
    })) as any;

    await this.jelRepo.save(linesData);

    return this.findById(saved.id, companyId);
  }

  async findAll(companyId: string, query?: QueryJournalEntryDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.jeRepo.createQueryBuilder('je');
    qb.where('je.companyId = :companyId', { companyId });
    qb.leftJoinAndSelect('je.lines', 'lines');
    qb.leftJoinAndSelect('lines.account', 'account');
    qb.orderBy('je.createdAt', 'DESC');

    if (query?.fiscalYearId) {
      qb.andWhere('je.fiscalYearId = :fiscalYearId', { fiscalYearId: query.fiscalYearId });
    }
    if (query?.periodId) {
      qb.andWhere('je.periodId = :periodId', { periodId: query.periodId });
    }
    if (query?.status) {
      qb.andWhere('je.status = :status', { status: query.status });
    }

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }

  async findById(id: string, companyId: string) {
    const entry = await this.jeRepo.findOne({
      where: { id, companyId } as any,
      relations: ['lines', 'lines.account', 'fiscalYear', 'period'],
    });
    if (!entry) throw new NotFoundException('Journal entry not found');
    return entry;
  }

  async update(id: string, dto: UpdateJournalEntryDto, companyId: string) {
    const entry = await this.findById(id, companyId);
    if (entry.status !== JournalEntryStatus.DRAFT) {
      throw new BadRequestException('Only draft entries can be updated');
    }

    if (dto.lines) {
      if (dto.lines.length < 2) {
        throw new BadRequestException('Journal entry must have at least 2 lines');
      }
      const totalDebit = dto.lines.reduce((sum, l) => sum + l.debit, 0);
      const totalCredit = dto.lines.reduce((sum, l) => sum + l.credit, 0);
      if (totalDebit !== totalCredit) {
        throw new BadRequestException('Total debit must equal total credit');
      }

      await this.jelRepo.delete({ journalEntryId: id } as any);

      const linesData = dto.lines.map((l) => ({
        journalEntryId: id,
        accountId: l.accountId,
        description: l.description,
        debit: l.debit,
        credit: l.credit,
      })) as any;

      await this.jelRepo.save(linesData);

      await this.jeRepo.update(id, {
        totalDebit,
        totalCredit,
        date: dto.date as any,
        description: dto.description,
        fiscalYearId: dto.fiscalYearId,
        periodId: dto.periodId,
        reference: dto.reference,
      } as any);
    } else {
      await this.jeRepo.update(id, dto as any);
    }

    return this.findById(id, companyId);
  }

  async post(id: string, companyId: string, userId: string) {
    const entry = await this.findById(id, companyId);
    if (entry.status !== JournalEntryStatus.DRAFT) {
      throw new BadRequestException('Only draft entries can be posted');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const line of entry.lines || []) {
        const account = await queryRunner.manager.findOne(Account, {
          where: { id: line.accountId } as any,
        });
        if (account) {
          const newBalance =
            (Number(account.currentBalance) || 0) + Number(line.debit) - Number(line.credit);
          await queryRunner.manager.update(Account, line.accountId, {
            currentBalance: newBalance,
          } as any);
        }
      }

      await queryRunner.manager.update(JournalEntry, id, {
        status: JournalEntryStatus.POSTED,
        postedAt: new Date(),
        postedBy: userId,
      } as any);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return this.findById(id, companyId);
  }

  async cancel(id: string, companyId: string) {
    const entry = await this.findById(id, companyId);
    if (entry.status === JournalEntryStatus.CANCELLED) {
      throw new BadRequestException('Entry is already cancelled');
    }
    if (entry.status === JournalEntryStatus.POSTED) {
      throw new BadRequestException('Posted entries must be reversed, not cancelled');
    }

    await this.jeRepo.update(id, { status: JournalEntryStatus.CANCELLED } as any);
    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    const entry = await this.findById(id, companyId);
    if (entry.status !== JournalEntryStatus.DRAFT) {
      throw new BadRequestException('Only draft entries can be deleted');
    }

    await this.jeRepo.softDelete(id);
    return { message: 'Journal entry deleted successfully' };
  }
}
