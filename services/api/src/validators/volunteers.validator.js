import { z } from 'zod';
import { REQUEST_TYPES } from './requests.validator.js';

const lat = z.number().min(-90).max(90);
const lng = z.number().min(-180).max(180);

export const registerVolunteerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).optional(),
  skills: z.array(z.enum(REQUEST_TYPES)).min(1).max(REQUEST_TYPES.length),
  lat,
  lng,
});

export const availabilitySchema = z.object({ available: z.boolean() });

export const locationSchema = z.object({ lat, lng });

export const listVolunteersQuerySchema = z.object({
  available: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(200).default(10),
  skill: z.enum(REQUEST_TYPES).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(5),
});