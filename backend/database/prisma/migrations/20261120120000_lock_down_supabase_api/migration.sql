-- Lock down Supabase's auto-generated REST/GraphQL API (PostgREST) for CreatorOS tables.
-- The app never uses it: the backend connects as the database owner (bypasses RLS) and the
-- dashboard uses Supabase only for Auth. Without this, the public "publishable" key could read
-- and write every table (verified: HTTP 200 on /rest/v1/Approval).
--  1. Enable Row Level Security on every table, with NO policies → anon/authenticated get nothing.
--  2. Revoke table privileges from the API roles, now and for tables created in future migrations.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = current_schema() LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', current_schema(), r.tablename);
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA %I FROM anon, authenticated', current_schema());
    EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA %I FROM anon, authenticated', current_schema());
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I REVOKE ALL ON TABLES FROM anon, authenticated', current_schema());
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I REVOKE ALL ON SEQUENCES FROM anon, authenticated', current_schema());
  END IF;
END $$;
