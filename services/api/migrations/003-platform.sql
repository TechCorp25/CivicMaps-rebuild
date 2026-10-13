-- The platform control plane is separate from council operational identities/data.
CREATE TABLE platform_operators (
  id uuid PRIMARY KEY, email text UNIQUE NOT NULL, name text NOT NULL,
  password_hash text NOT NULL, active boolean NOT NULL DEFAULT true
);
CREATE TABLE platform_sessions (
  token_hash text PRIMARY KEY, operator_id uuid NOT NULL REFERENCES platform_operators(id),
  csrf_token text NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE platform_municipalities (
  id uuid PRIMARY KEY, name text NOT NULL,
  slug text UNIQUE NOT NULL CHECK (slug ~ '^[a-z][a-z0-9]*(-[a-z0-9]+)*$'),
  status text NOT NULL CHECK (status IN ('Active', 'Provisioning', 'Suspended')),
  packs jsonb NOT NULL, version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE platform_first_admins (
  municipality_id uuid PRIMARY KEY REFERENCES platform_municipalities(id),
  first_name text NOT NULL, last_name text NOT NULL, email text UNIQUE NOT NULL,
  password_hash text NOT NULL, activation_state text NOT NULL DEFAULT 'Pending'
);
CREATE TABLE platform_metrics (
  municipality_id uuid PRIMARY KEY REFERENCES platform_municipalities(id),
  officers_online integer NOT NULL CHECK (officers_online >= 0),
  officers_today integer NOT NULL CHECK (officers_today >= 0),
  code21_7d integer NOT NULL CHECK (code21_7d >= 0),
  health text NOT NULL CHECK (health IN ('Healthy', 'Degraded', 'Not yet live')),
  signal text, degraded_since timestamptz, observed_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'synthetic-fixture'
);
CREATE TABLE platform_pack_workload (
  municipality_id uuid NOT NULL REFERENCES platform_municipalities(id),
  pack text NOT NULL, open_count integer NOT NULL CHECK (open_count >= 0),
  PRIMARY KEY (municipality_id, pack)
);
CREATE TABLE platform_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  operator_id uuid NOT NULL REFERENCES platform_operators(id),
  municipality_id uuid NOT NULL REFERENCES platform_municipalities(id),
  action text NOT NULL, details jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE platform_receipts (
  operator_id uuid NOT NULL REFERENCES platform_operators(id), key text NOT NULL,
  fingerprint text NOT NULL, response jsonb NOT NULL,
  PRIMARY KEY (operator_id, key)
);
-- Council app role receives no platform-table access. Operator role receives
-- only control-plane access, never SELECT on council service_requests/users.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'civicmaps_platform_app') THEN
    CREATE ROLE civicmaps_platform_app NOLOGIN NOSUPERUSER NOBYPASSRLS;
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO civicmaps_platform_app;
GRANT SELECT, INSERT, UPDATE ON platform_municipalities TO civicmaps_platform_app;
GRANT SELECT, INSERT ON platform_first_admins, platform_audit, platform_receipts TO civicmaps_platform_app;
GRANT SELECT ON platform_metrics, platform_pack_workload TO civicmaps_platform_app;
GRANT USAGE, SELECT ON SEQUENCE platform_audit_id_seq TO civicmaps_platform_app;
CREATE FUNCTION platform_slug_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.slug IS DISTINCT FROM OLD.slug THEN RAISE EXCEPTION 'Municipality slug is immutable'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER platform_slug_immutable BEFORE UPDATE ON platform_municipalities
  FOR EACH ROW EXECUTE FUNCTION platform_slug_immutable();
