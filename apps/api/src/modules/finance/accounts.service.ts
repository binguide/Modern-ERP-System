import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto, UpdateAccountDto, QueryAccountsDto } from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async create(dto: CreateAccountDto, companyId: string) {
    const existing = await this.accountRepo.findOneBy({ code: dto.code, companyId } as any);
    if (existing) throw new ConflictException('Account code already exists');

    const account = this.accountRepo.create({ ...dto, companyId } as any);
    return this.accountRepo.save(account);
  }

  async findAll(companyId: string, query?: QueryAccountsDto) {
    const where: any = { companyId };
    if (query?.type) where.type = query.type;
    if (query?.isActive !== undefined) where.isActive = query.isActive;

    const accounts = await this.accountRepo.find({
      where,
      order: { code: 'ASC' },
      relations: ['parent'],
    });

    return accounts;
  }

  async findTree(companyId: string) {
    const accounts = await this.accountRepo.find({
      where: { companyId } as any,
      order: { code: 'ASC' },
      relations: ['parent'],
    });

    const map = new Map<string, any>();
    const roots: any[] = [];

    accounts.forEach((a) => {
      map.set(a.id, { ...a, children: [] });
    });

    accounts.forEach((a) => {
      const node = map.get(a.id);
      if (a.parentId && map.has(a.parentId)) {
        map.get(a.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async findById(id: string, companyId: string) {
    const account = await this.accountRepo.findOne({
      where: { id, companyId } as any,
      relations: ['parent'],
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async update(id: string, dto: UpdateAccountDto, companyId: string) {
    const account = await this.findById(id, companyId);
    if (dto.code && dto.code !== account.code) {
      const existing = await this.accountRepo.findOneBy({ code: dto.code, companyId } as any);
      if (existing) throw new ConflictException('Account code already exists');
    }

    await this.accountRepo.update(id, dto as any);
    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);

    const children = await this.accountRepo.countBy({ parentId: id, companyId } as any);
    if (children > 0) throw new ConflictException('Cannot delete account with sub-accounts');

    await this.accountRepo.softDelete(id);
    return { message: 'Account deleted successfully' };
  }
}
