import pg from 'pg';
import { Redis } from 'ioredis';
import { config } from './config.js';
import { logger } from './logger.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error({ err }, 'unexpected postgres pool error');
});

export const redis = new Redis(config.redisUrl, {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => Math.min(times * 200, 2000),
});

redis.on('error', (err) => {
  logger.error({ code: err.code ?? err.message }, 'redis error');
});

redis.on('ready', () => logger.info('redis connected'));