import { pool } from '../db.js';

const COLUMNS = `id, user_id, name, phone, skills, lat, lng,
  is_available, last_seen_at, created_at`;

export const createVolunteer = async (v) => {
  const { rows } = await pool.query(
    `INSERT INTO volunteers (name, phone, skills, lat, lng)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUMNS}`,
    [v.name, v.phone ?? null, v.skills, v.lat, v.lng],
  );
  return rows[0];
};

export const getVolunteerById = async (id) => {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM volunteers WHERE id = $1`, [id]);
  return rows[0] ?? null;
};

export const listVolunteers = async ({ available, limit, offset }) => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM volunteers
     WHERE ($1::boolean IS NULL OR is_available = $1)
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [available ?? null, limit, offset],
  );
  return rows;
};

export const setAvailability = async (id, available) => {
  const { rows } = await pool.query(
    `UPDATE volunteers SET is_available = $2, last_seen_at = now()
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id, available],
  );
  return rows[0] ?? null;
};

export const updateLocation = async (id, lat, lng) => {
  const { rows } = await pool.query(
    `UPDATE volunteers SET lat = $2, lng = $3, last_seen_at = now()
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id, lat, lng],
  );
  return rows[0] ?? null;
};

// Haversine formula: distance in km between two lat/lng points (Earth radius 6371 km).
// It is computed for EVERY available volunteer, so it gets slow as data grows.
// Day 8 replaces this with Redis geo search.
export const findNearby = async ({ lat, lng, radiusKm, skill, limit }) => {
  const { rows } = await pool.query(
    `SELECT * FROM (
       SELECT ${COLUMNS},
         6371 * acos(least(1,
           cos(radians($1)) * cos(radians(lat)) * cos(radians(lng) - radians($2))
           + sin(radians($1)) * sin(radians(lat))
         )) AS distance_km
       FROM volunteers
       WHERE is_available = true
         AND ($4::text IS NULL OR $4 = ANY(skills))
     ) v
     WHERE distance_km <= $3
     ORDER BY distance_km
     LIMIT $5`,
    [lat, lng, radiusKm, skill ?? null, limit],
  );
  return rows;
};