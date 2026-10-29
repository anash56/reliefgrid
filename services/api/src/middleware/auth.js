import { jwtVerify } from 'jose';
import { config } from '../config.js';
import { AppError } from './errors.js';

const secretKey = new TextEncoder().encode(config.jwt.secret);

export const authenticate = async (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Missing or malformed Authorization header');
  }

  try {
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ['HS256'] });
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Token is invalid or expired');
  }

  next();
};