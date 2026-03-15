-- War Room Waitlist
-- Tracks who wants to be notified when War Room launches.
-- Authenticated users are deduplicated by user_id.
-- Anonymous users are deduplicated by email.

-- Table
CREATE TABLE IF NOT EXISTS war_room_interest (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partial unique indexes for deduplication
CREATE UNIQUE INDEX IF NOT EXISTS war_room_interest_user_unique
  ON war_room_interest (user_id) WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS war_room_interest_email_unique
  ON war_room_interest (email) WHERE email IS NOT NULL;

-- RLS
ALTER TABLE war_room_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert interest"
  ON war_room_interest FOR INSERT
  WITH CHECK (true);

-- register_war_room_interest(user_email text)
-- Authenticated: inserts user_id, ignores user_email, ON CONFLICT DO NOTHING.
-- Anonymous: inserts email, ON CONFLICT DO NOTHING.
-- Returns { success: true }.
CREATE OR REPLACE FUNCTION register_war_room_interest(user_email TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NOT NULL THEN
    INSERT INTO war_room_interest (user_id)
    VALUES (v_uid)
    ON CONFLICT (user_id) WHERE user_id IS NOT NULL DO NOTHING;
  ELSIF user_email IS NOT NULL AND user_email <> '' THEN
    INSERT INTO war_room_interest (email)
    VALUES (lower(trim(user_email)))
    ON CONFLICT (email) WHERE email IS NOT NULL DO NOTHING;
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- get_war_room_interest_count()
-- Returns total count of interested users.
CREATE OR REPLACE FUNCTION get_war_room_interest_count()
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM war_room_interest;
  RETURN json_build_object('count', v_count);
END;
$$;
