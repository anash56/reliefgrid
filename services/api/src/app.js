import express from 'express';
import { httpLogger } from './middleware/httpLogger.js';
import { notFound, errorHandler } from './middleware/errors.js';
import { healthRouter } from './routes/health.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(httpLogger);
app.use(express.json({ limit: '100kb' }));

app.use('/health', healthRouter);

// These two must stay LAST
app.use(notFound);
app.use(errorHandler);