import { prisma } from '../db.js';

// Prisma's update() throws P2025 when no row matches. Our service expects null.
const orNull = async (promise) => {
  try {
    return await promise;
  } catch (err) {
    if (err.code === 'P2025') return null;
    throw err;
  }
};

export const createVolunteer = (v) =>
  prisma.volunteer.create({
    data: { name: v.name, phone: v.phone ?? null, skills: v.skills, lat: v.lat, lng: v.lng },
  });

export const getVolunteerById = (id) => prisma.volunteer.findUnique({ where: { id } });

export const listVolunteers = ({ available, limit, offset }) =>
  prisma.volunteer.findMany({
    where: available === undefined ? {} : { is_available: available },
    orderBy: { created_at: 'desc' },
    take: limit,
    skip: offset,
  });

export const setAvailability = (id, available) =>
  orNull(
    prisma.volunteer.update({
      where: { id },
      data: { is_available: available, last_seen_at: new Date() },
    }),
  );

export const updateLocation = (id, lat, lng) =>
  orNull(
    prisma.volunteer.update({
      where: { id },
      data: { lat, lng, last_seen_at: new Date() },
    }),
  );

// Raw SQL on purpose: Prisma has no distance function. Redis geo replaces this later.
// skills is cast to text[] because Prisma does not parse enum arrays in raw results.
export const findNearby = ({ lat, lng, radiusKm, skill, limit }) =>
  prisma.$queryRaw`
    SELECT * FROM (
      SELECT id, user_id, name, phone, skills::text[] AS skills, lat, lng,
        is_available, last_seen_at, created_at,
        6371 * acos(least(1,
          cos(radians(${lat}::float8)) * cos(radians(lat)) * cos(radians(lng) - radians(${lng}::float8))
          + sin(radians(${lat}::float8)) * sin(radians(lat))
        )) AS distance_km
      FROM volunteers
      WHERE is_available = true
        AND (${skill ?? null}::request_type IS NULL
             OR ${skill ?? null}::request_type = ANY(skills))
    ) v
    WHERE distance_km <= ${radiusKm}::float8
    ORDER BY distance_km
    LIMIT ${limit}::int`;