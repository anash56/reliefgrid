import { z } from 'zod';

export const REQUEST_TYPES = ['rescue', 'medical', 'food', 'water', 'shelter', 'transport', 'other'];
export const REQUEST_STATUSES = [
  'open', 'offered', 'accepted', 'in_progress', 'resolved', 'escalated', 'cancelled',
];

export const createRequestSchema = z.object({
  type: z.enum(REQUEST_TYPES),
  description: z.string().trim().min(5).max(1000),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  urgency: z.number().int().min(1).max(5),
  contact: z.string().trim().max(100).optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export const listQuerySchema = z.object({
  status: z.enum(REQUEST_STATUSES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});