-- ============================================================
-- BizInsight PostgreSQL Schema
-- Run once to initialise the database.
-- psql -U bizinsight -d bizinsight -f db/schema.sql
-- ============================================================

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,
  password    TEXT        NOT NULL,   -- bcrypt hash
  role        TEXT        NOT NULL DEFAULT 'viewer'
                          CHECK (role IN ('superadmin','admin','viewer')),
  avatar      TEXT,
  status      TEXT        NOT NULL DEFAULT 'Active'
                          CHECK (status IN ('Active','Inactive')),
  joined      DATE        NOT NULL DEFAULT CURRENT_DATE,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Role Permissions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS role_permissions (
  id           SERIAL  PRIMARY KEY,
  role         TEXT    NOT NULL CHECK (role IN ('admin','viewer')),
  module       TEXT    NOT NULL,
  enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (role, module)
);

-- ── Datasets ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS datasets (
  id              SERIAL PRIMARY KEY,
  uploaded_by     INT    REFERENCES users(id) ON DELETE SET NULL,
  filename        TEXT   NOT NULL,
  data_type       TEXT,
  rows_processed  INT,
  columns_detected INT,
  size_kb         NUMERIC(10,2),
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PDF Reports ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pdf_reports (
  id          SERIAL PRIMARY KEY,
  uploaded_by INT  REFERENCES users(id) ON DELETE SET NULL,
  filename    TEXT NOT NULL,
  pages       INT,
  word_count  INT,
  summary     TEXT,
  topics      TEXT[],       -- array of topic strings
  sentiment   TEXT,
  confidence  INT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Seed: Default users ──────────────────────────────────────
-- Passwords are bcrypt hashes of "Admin@123"
INSERT INTO users (name, email, password, role, avatar, status, joined) VALUES
  ('Shijo Varghese', 'shijo@bizinsight.io',  '$2b$12$placeholder_super', 'superadmin', 'SV', 'Active', '2024-01-01'),
  ('Anika Sharma',   'anika@bizinsight.io',  '$2b$12$placeholder_admin', 'admin',      'AS', 'Active', '2024-02-15'),
  ('Rohan Mehta',    'rohan@bizinsight.io',  '$2b$12$placeholder_admin', 'admin',      'RM', 'Active', '2024-03-08'),
  ('David Chen',     'david@bizinsight.io',  '$2b$12$placeholder_view',  'viewer',     'DC', 'Active', '2024-05-20')
ON CONFLICT (email) DO NOTHING;

-- ── Seed: Default permissions ────────────────────────────────
INSERT INTO role_permissions (role, module, enabled) VALUES
  ('admin',  'dashboard',   TRUE),
  ('admin',  'analytics',   TRUE),
  ('admin',  'sentiment',   TRUE),
  ('admin',  'competitor',  TRUE),
  ('admin',  'predictions', TRUE),
  ('admin',  'liveData',    TRUE),
  ('admin',  'dataSources', TRUE),
  ('admin',  'reports',     TRUE),
  ('admin',  'settings',    TRUE),
  ('viewer', 'dashboard',   TRUE),
  ('viewer', 'analytics',   FALSE),
  ('viewer', 'sentiment',   FALSE),
  ('viewer', 'competitor',  FALSE),
  ('viewer', 'predictions', FALSE),
  ('viewer', 'liveData',    TRUE),
  ('viewer', 'dataSources', FALSE),
  ('viewer', 'reports',     FALSE),
  ('viewer', 'settings',    FALSE)
ON CONFLICT (role, module) DO NOTHING;
