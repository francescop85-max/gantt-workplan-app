CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS workplans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  share_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workplan_id UUID NOT NULL REFERENCES workplans(id) ON DELETE CASCADE,
  code TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'task',
  parent_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL DEFAULT '',
  responsible TEXT NOT NULL DEFAULT '',
  comments TEXT NOT NULL DEFAULT '',
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  progress INTEGER NOT NULL DEFAULT 0,
  depends_on UUID REFERENCES tasks(id) ON DELETE SET NULL
);
