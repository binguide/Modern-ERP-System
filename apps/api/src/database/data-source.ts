import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'erp',
  password: process.env.DB_PASSWORD ?? 'erp',
  database: process.env.DB_DATABASE ?? 'modern_erp',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
