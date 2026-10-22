import pg from 'pg';
import { Redis } from 'ioredis';
import { config } from './config.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  connectionTimeoutMillis: 2000, // give up on connecting after 2s
});

export const redis = new Redis(config.redisUrl, {
  enableOfflineQueue: false,   // don't park commands while disconnected, fail them
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => Math.min(times * 200, 2000), // keep reconnecting, max 2s apart
});

redis.on('error', (err) => {
  console.error('Redis error:', err.code ?? err.message);
});