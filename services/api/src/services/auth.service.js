import { createHash, randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import { SignJWT } from 'jose';
import { config } from '../config.js';
import { AppError } from '../middleware/errors.js';
import * as usersRepo from '../repositories/users.repo.js';
import * as tokensRepo from '../repositories/refreshTokens.repo.js';

const secretKey = new TextEncoder().encode(config.jwt.secret);

// A real hash we can compare against when the email doesn't exist,
// so "unknown email" and "wrong password" take the same time.
const DUMMY_HASH = await argon2.hash('not-a-real-password');

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

const toPublicUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
});

const issueTokens = async (user) => {
  const accessToken = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(config.jwt.accessTtl)
    .sign(secretKey);

  const refreshToken = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + config.refreshTtlDays * 24 * 60 * 60 * 1000);
  await tokensRepo.insertToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: config.jwt.accessTtl };
};

export const register = async ({ email, password, role }) => {
  const passwordHash = await argon2.hash(password);

  let user;
  try {
    user = await usersRepo.createUser({ email, passwordHash, role });
  } catch (err) {
    // 23505 = Postgres "unique violation": the email already exists
    if (err.code === '23505') {
      throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
    }
    throw err;
  }

  return { user: toPublicUser(user), ...(await issueTokens(user)) };
};

export const login = async ({ email, password }) => {
  const user = await usersRepo.findByEmail(email);
  const passwordOk = await argon2.verify(user?.password_hash ?? DUMMY_HASH, password);

  if (!user || !passwordOk) {
    // Same message for both cases, so attackers can't discover which emails exist
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }

  return { user: toPublicUser(user), ...(await issueTokens(user)) };
};

export const refresh = async (refreshToken) => {
  const tokenHash = hashToken(refreshToken);
  const userId = await tokensRepo.consumeToken(tokenHash);

  if (!userId) {
    // A token that was already used is being used again: possible theft.
    // Kill every session of that user.
    const stale = await tokensRepo.findByHash(tokenHash);
    if (stale?.revoked_at) {
      await tokensRepo.revokeAllForUser(stale.user_id);
    }
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
  }

  const user = await usersRepo.findById(userId);
  if (!user) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
  }

  return issueTokens(user);
};

export const logout = async (refreshToken) => {
  await tokensRepo.revokeByHash(hashToken(refreshToken));
};

export const getMe = async (userId) => {
  const user = await usersRepo.findById(userId);
  if (!user) throw new AppError(401, 'INVALID_TOKEN', 'Account no longer exists');
  return user;
};