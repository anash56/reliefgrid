import express from 'express';
import { config } from './config.js';
import { pool, redis } from './db.js';

const app = express();
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    const pong = await redis.ping();
    res.json({ status: 'ok', postgres: 'up', redis: pong === 'PONG' ? 'up' : 'down' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

const server = app.listen(config.port, () => {
  console.log(`API running on port ${config.port}`);
});

// Graceful shutdown: finish current requests, close connections, then exit
const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close();
  await Promise.all([pool.end(), redis.quit()]);
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));