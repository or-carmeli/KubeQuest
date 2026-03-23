-- Architecture Scenarios Waitlist
-- Tracks who wants to be notified when Architecture Scenarios launches.
-- Mirrors war_room_interest structure.

SET search_path = public;

-- Table
CREATE TABLE IF NOT EXISTS arch_scenarios_interest (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partial unique indexes for deduplication
CREATE UNIQUE INDEX IF NOT EXISTS arch_scenarios_interest_user_unique
  ON arch_scenarios_interest (user_id) WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS arch_scenarios_interest_email_unique
  ON arch_scenarios_interest (email) WHERE email IS NOT NULL;

-- RLS
ALTER TABLE arch_scenarios_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert interest"
  ON arch_scenarios_interest FOR INSERT
  WITH CHECK (true);

-- register_arch_scenarios_interest(user_email text)
CREATE OR REPLACE FUNCTION register_arch_scenarios_interest(user_email TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NOT NULL THEN
    INSERT INTO arch_scenarios_interest (user_id)
    VALUES (v_uid)
    ON CONFLICT (user_id) WHERE user_id IS NOT NULL DO NOTHING;
  ELSIF user_email IS NOT NULL AND user_email <> '' THEN
    INSERT INTO arch_scenarios_interest (email)
    VALUES (lower(trim(user_email)))
    ON CONFLICT (email) WHERE email IS NOT NULL DO NOTHING;
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- get_arch_scenarios_interest_count()
CREATE OR REPLACE FUNCTION get_arch_scenarios_interest_count()
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM arch_scenarios_interest;
  RETURN json_build_object('count', v_count);
END;
$$;

-- check_arch_scenarios_interest()
CREATE OR REPLACE FUNCTION check_arch_scenarios_interest()
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_exists BOOLEAN;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN json_build_object('registered', false);
  END IF;
  SELECT EXISTS(
    SELECT 1 FROM arch_scenarios_interest WHERE user_id = v_uid
  ) INTO v_exists;
  RETURN json_build_object('registered', v_exists);
END;
$$;
