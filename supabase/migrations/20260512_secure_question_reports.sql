-- Create and secure the question_reports table.
-- The app was inserting into this table without a migration defining it.

CREATE TABLE IF NOT EXISTS question_reports (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  question_text TEXT NOT NULL CHECK (length(question_text) <= 300),
  report_type TEXT NOT NULL CHECK (length(report_type) <= 50),
  note        TEXT CHECK (note IS NULL OR length(note) <= 1000),
  user_id     UUID,
  topic       TEXT CHECK (topic IS NULL OR length(topic) <= 100),
  level       TEXT CHECK (level IS NULL OR length(level) <= 50)
);

ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

-- Allow any user (including anon/guest) to insert reports
CREATE POLICY "anyone_can_insert_reports"
  ON question_reports
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read their own reports
CREATE POLICY "users_read_own_reports"
  ON question_reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- No UPDATE or DELETE policies -- reports are immutable once submitted
