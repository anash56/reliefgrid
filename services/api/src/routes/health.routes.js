import { Router } from 'express';
import { pool, redis } from '../db.js';

export const healthRouter = Router();

const check = async (fn) => {
  try {
    await fn();
    return 'up';
  } catch {
    return 'down';
  }
};

// Liveness: "is the process running?" Never touches dependencies.
healthRouter.get('/live', (_req, res) => {
  res.json({ status: 'alive' });
});

// Readiness: "can I actually serve traffic?" Checks Postgres and Redis.
const ready = async (_req, res) => {
  const [postgres, redisStatus] = await Promise.all([
    check(() => pool.query('SELECT 1')),
    check(async () => {
      if ((await redis.ping()) !== 'PONG') throw new Error('bad ping');
    }),
  ]);

  const healthy = postgres === 'up' && redisStatus === 'up';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    postgres,
    redis: redisStatus,
  });
};

healthRouter.get('/', ready);
healthRouter.get('/ready', ready);