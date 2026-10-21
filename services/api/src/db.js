import pg from 'pg';
import { Redis } from 'ioredis';
import { config } from './config.js';

// pg is an older-style package, so we import it whole, then pull Pool out of it
export const pool = new pg.Pool({ connectionString: config.databaseUrl });

export const redis = new Redis(config.redisUrl);