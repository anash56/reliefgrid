import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Redis } from 'ioredis';
import { config } from './config.js';
import { logger } from './logger.js';

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
  connectionTimeoutMillis: 2000, // fail fast when Postgres is down
});

export const prisma = new PrismaClient({ adapter });

export const redis = new Redis(config.redisUrl, {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => Math.min(times * 200, 2000),
});

redis.on('error', (err) => {
  logger.error({ code: err.code ?? err.message }, 'redis error');
});

redis.on('ready', () => logger.info('redis connected'));