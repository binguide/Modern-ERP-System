import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
  ) {}

  async create(dto: CreateCurrencyDto, companyId: string) {
    const currency = this.currencyRepo.create({ ...dto, companyId } as any);
    if (dto.isBase) {
      await this.currencyRepo.update({ companyId, isBase: true } as any, { isBase: false });
    }
    return this.currencyRepo.save(currency);
  }

  async findAll(companyId: string) {
    return this.currencyRepo.find({
      where: { companyId } as any,
      order: { isBase: 'DESC', code: 'ASC' },
    });
  }

  async findById(id: string, companyId: string) {
    const currency = await this.currencyRepo.findOne({ where: { id, companyId } as any });
    if (!currency) throw new NotFoundException('Currency not found');
    return currency;
  }

  async update(id: string, dto: UpdateCurrencyDto, companyId: string) {
    await this.findById(id, companyId);
    if (dto.isBase) {
      await this.currencyRepo.update({ companyId, isBase: true } as any, { isBase: false });
    }
    await this.currencyRepo.update(id, dto as any);
    return this.findById(id, companyId);
  }

  async remove(id: string, companyId: string) {
    await this.findById(id, companyId);
    await this.currencyRepo.softDelete(id);
    return { message: 'Currency deleted successfully' };
  }
}
