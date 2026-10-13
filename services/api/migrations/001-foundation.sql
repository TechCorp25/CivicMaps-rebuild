CREATE TABLE users (
  id uuid PRIMARY KEY, email text NOT NULL UNIQUE, name text NOT NULL, password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('DISPATCHER', 'OFFICER', 'SUPERVISOR')),
  tenant_id text NOT NULL, jurisdiction_id text NOT NULL, data_plane_id text NOT NULL,
  organisation_id text NOT NULL, branch_id text NOT NULL, team_id text NOT NULL,
  active boolean NOT NULL DEFAULT true
);
CREATE TABLE sessions (
  token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id),
  csrf_token text NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE service_requests (
  id uuid PRIMARY KEY, number bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  tenant_id text NOT NULL, jurisdiction_id text NOT NULL, data_plane_id text NOT NULL,
  organisation_id text NOT NULL, branch_id text NOT NULL, address text NOT NULL,
  latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  notes text NOT NULL,
  status text NOT NULL CHECK (status IN ('RECEIVED', 'DISPATCHED', 'ACKNOWLEDGED', 'ATTENDED', 'CLOSED')),
  assigned_officer_id uuid REFERENCES users(id), version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, request_id uuid NOT NULL REFERENCES service_requests(id),
  tenant_id text NOT NULL, jurisdiction_id text NOT NULL, data_plane_id text NOT NULL,
  organisation_id text NOT NULL, branch_id text NOT NULL, actor_id uuid NOT NULL REFERENCES users(id),
  action text NOT NULL, details jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE mutation_receipts (
  actor_id uuid NOT NULL REFERENCES users(id), key text NOT NULL, fingerprint text NOT NULL,
  response jsonb NOT NULL, PRIMARY KEY (actor_id, key)
);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'civicmaps_local_app') THEN
    CREATE ROLE civicmaps_local_app NOLOGIN NOSUPERUSER NOBYPASSRLS;
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO civicmaps_local_app;
GRANT SELECT ON users TO civicmaps_local_app;
GRANT SELECT, INSERT, UPDATE ON service_requests TO civicmaps_local_app;
GRANT SELECT, INSERT ON audit_events, mutation_receipts TO civicmaps_local_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO civicmaps_local_app;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events FORCE ROW LEVEL SECURITY;
CREATE POLICY request_scope ON service_requests TO civicmaps_local_app USING (
  tenant_id = current_setting('civicmaps.tenant', true)
  AND jurisdiction_id = current_setting('civicmaps.jurisdiction', true)
  AND data_plane_id = current_setting('civicmaps.plane', true)
  AND organisation_id = current_setting('civicmaps.organisation', true)
  AND branch_id = current_setting('civicmaps.branch', true)
);
CREATE POLICY audit_scope ON audit_events TO civicmaps_local_app USING (
  tenant_id = current_setting('civicmaps.tenant', true)
  AND jurisdiction_id = current_setting('civicmaps.jurisdiction', true)
  AND data_plane_id = current_setting('civicmaps.plane', true)
  AND organisation_id = current_setting('civicmaps.organisation', true)
  AND branch_id = current_setting('civicmaps.branch', true)
);
