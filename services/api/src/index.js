import express from 'express';
import { config } from './config.js';
import { pool, redis } from './db.js';

const app = express();
app.use(express.json());

app.get('/health', async (req, res) => {
  const check = async (fn) => {
    try {
      await fn();
      return 'up';
    } catch {
      return 'down';
    }
  };

  const postgres = await check(() => pool.query('SELECT 1'));
  const redisStatus = await check(async () => {
    if ((await redis.ping()) !== 'PONG') throw new Error('bad ping');
  });

  const healthy = postgres === 'up' && redisStatus === 'up';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    postgres,
    redis: redisStatus,
  });
});

const server = app.listen(config.port, () => {
  console.log(`API running on port ${config.port}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close();
  await Promise.allSettled([pool.end(), redis.quit()]);
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));