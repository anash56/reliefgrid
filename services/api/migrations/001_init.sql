CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('citizen', 'volunteer', 'coordinator', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       UUID REFERENCES users(id),
  type           TEXT NOT NULL CHECK (type IN ('rescue', 'medical', 'food', 'water', 'shelter', 'transport', 'other')),
  description    TEXT NOT NULL,
  lat            DOUBLE PRECISION NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng            DOUBLE PRECISION NOT NULL CHECK (lng BETWEEN -180 AND 180),
  urgency        SMALLINT NOT NULL CHECK (urgency BETWEEN 1 AND 5),
  priority_score INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open', 'offered', 'accepted', 'in_progress', 'resolved', 'escalated', 'cancelled')),
  report_count   INTEGER NOT NULL DEFAULT 1,
  contact        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_requests_status_created ON requests (status, created_at DESC);

CREATE TABLE request_history (
  id          BIGSERIAL PRIMARY KEY,
  request_id  UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status   TEXT NOT NULL,
  actor       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_request_history_request ON request_history (request_id, created_at);