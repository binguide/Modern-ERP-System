import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedDatabase } from './seeds/seed';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    if (process.env.DB_SYNCHRONIZE === 'true' || process.env.NODE_ENV === 'development') {
      await seedDatabase(this.dataSource);
    }
  }
}
