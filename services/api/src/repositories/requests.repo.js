import { pool } from '../db.js';

const COLUMNS = `id, owner_id, type, description, lat, lng, urgency,
  priority_score, status, report_count, contact, created_at, updated_at`;

export const createRequest = async (data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO requests (type, description, lat, lng, urgency, priority_score, contact)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${COLUMNS}`,
      [data.type, data.description, data.lat, data.lng, data.urgency, data.priorityScore, data.contact ?? null],
    );
    const request = rows[0];

    await client.query(
      `INSERT INTO request_history (request_id, from_status, to_status, actor)
       VALUES ($1, NULL, $2, $3)`,
      [request.id, request.status, 'anonymous'],
    );

    await client.query('COMMIT');
    return request;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getRequestById = async (id) => {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM requests WHERE id = $1`, [id]);
  return rows[0] ?? null;
};

export const listRequests = async ({ status, limit, offset }) => {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM requests
     WHERE ($1::text IS NULL OR status = $1)
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [status ?? null, limit, offset],
  );
  return rows;
};