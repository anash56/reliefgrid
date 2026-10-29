import { prisma } from '../db.js';

const PUBLIC = { id: true, email: true, role: true, created_at: true };

export const createUser = ({ email, passwordHash, role }) =>
  prisma.user.create({ data: { email, password_hash: passwordHash, role }, select: PUBLIC });

// No select, so it includes password_hash: only the login flow uses this one
export const findByEmail = (email) => prisma.user.findUnique({ where: { email } });

export const findById = (id) => prisma.user.findUnique({ where: { id }, select: PUBLIC });