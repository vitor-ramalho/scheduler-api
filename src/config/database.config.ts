import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgres://scheduler:scheduler@localhost:5432/scheduler_db';

  return {
    type: 'postgres',
    url: connectionString,
    synchronize: process.env.NODE_ENV !== 'production', // Don't use synchronize in production
    logging: process.env.NODE_ENV !== 'production',
    retryAttempts: 10,
    retryDelay: 3000,
    autoLoadEntities: true,
  };
});
