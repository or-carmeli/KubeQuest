-- check_war_room_interest()
-- Returns whether the current authenticated user is already registered
-- in the war_room_interest table.
-- Anonymous/unauthenticated: returns { registered: false }.

CREATE OR REPLACE FUNCTION check_war_room_interest()
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
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
    SELECT 1 FROM war_room_interest WHERE user_id = v_uid
  ) INTO v_exists;
  RETURN json_build_object('registered', v_exists);
END;
$$;
