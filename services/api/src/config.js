const required = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  databaseUrl: required('DATABASE_URL'),
  redisUrl: required('REDIS_URL'),
  jwt: {
    secret: jwtSecret,
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  },
  refreshTtlDays: Number(process.env.REFRESH_TTL_DAYS ?? 7),
};