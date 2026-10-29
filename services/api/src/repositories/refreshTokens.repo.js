import { prisma } from '../db.js';

export const insertToken = ({ userId, tokenHash, expiresAt }) =>
  prisma.refreshToken.create({
    data: { user_id: userId, token_hash: tokenHash, expires_at: expiresAt },
  });

// Raw SQL on purpose: a single atomic UPDATE ... RETURNING means two simultaneous
// refreshes can never both succeed. Two separate Prisma calls would leave a gap.
export const consumeToken = async (tokenHash) => {
  const rows = await prisma.$queryRaw`
    UPDATE refresh_tokens SET revoked_at = now()
    WHERE token_hash = ${tokenHash} AND revoked_at IS NULL AND expires_at > now()
    RETURNING user_id`;
  return rows[0]?.user_id ?? null;
};

export const findByHash = (tokenHash) =>
  prisma.refreshToken.findUnique({
    where: { token_hash: tokenHash },
    select: { user_id: true, revoked_at: true },
  });

export const revokeByHash = (tokenHash) =>
  prisma.refreshToken.updateMany({
    where: { token_hash: tokenHash, revoked_at: null },
    data: { revoked_at: new Date() },
  });

export const revokeAllForUser = (userId) =>
  prisma.refreshToken.updateMany({
    where: { user_id: userId, revoked_at: null },
    data: { revoked_at: new Date() },
  });