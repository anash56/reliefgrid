import { z } from 'zod';

const email = z.string().trim().toLowerCase().email().max(254);

export const registerSchema = z.object({
  email,
  password: z.string().min(8).max(128),
  // Coordinator and admin accounts are never self-service (SRS FR-A1)
  role: z.enum(['citizen', 'volunteer']),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20).max(200),
});