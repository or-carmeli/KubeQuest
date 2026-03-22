-- ── Hotfix: drop stale 3-param RPC overloads ────────────────────────────────
--
-- Bug: The 20260414 migration used CREATE OR REPLACE to add a p_mode
-- parameter to check_quiz_answer / check_daily_answer.  In PostgreSQL,
-- CREATE OR REPLACE only replaces a function with the SAME signature.
-- Adding a parameter creates a NEW overload, leaving the old 3-param
-- version in place.  PostgREST then fails with an ambiguity error when
-- the client omits optional params, because it cannot choose between
-- the two overloads.  The app treats RPC failure as stale state and
-- redirects the user to the home screen ("kicked out").
--
-- Fix: Drop the old (INT, SMALLINT, TEXT) overloads.  Only the new
-- 4-param versions should exist.
--
-- Safe to run multiple times (IF EXISTS).

DROP FUNCTION IF EXISTS check_quiz_answer(INT, SMALLINT, TEXT);
DROP FUNCTION IF EXISTS check_daily_answer(INT, SMALLINT, TEXT);
