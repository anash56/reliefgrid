import pino from 'pino';
import { config } from './config.js';

export const logger = pino({
  level: config.logLevel,
  base: { service: 'api' },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie'],
    censor: '[redacted]',
  },
  ...(config.env === 'development' && {
    transport: { target: 'pino-pretty', options: { colorize: true } },
  }),
});