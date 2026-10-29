import { app } from './app.js';
import { config } from './config.js';
import { logger } from './logger.js';
import { prisma, redis } from './db.js';

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.env }, 'API listening');
});

let shuttingDown = false;

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'shutting down');

  // If something hangs, force exit after 10 seconds
  setTimeout(() => process.exit(1), 10_000).unref();

  server.close();
  await Promise.allSettled([prisma.$disconnect(), redis.quit()]);
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaught exception, exiting');
  process.exit(1);
});