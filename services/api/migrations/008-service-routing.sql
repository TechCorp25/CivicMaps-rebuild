-- Routes never grant access: council manifests point at an existing immutable context/resource.
CREATE TABLE service_routes (
  id uuid PRIMARY KEY,
  hostname text NOT NULL UNIQUE CHECK (hostname ~ '^[a-z0-9]+(-[a-z0-9]+)*\.dev\.civicmaps\.com\.au$'),
  service text NOT NULL CHECK (service IN ('platform','commandmaps')),
  municipality_id uuid REFERENCES platform_municipalities(id),
  binding_id uuid REFERENCES operating_context_bindings(id),
  job_id uuid REFERENCES municipality_resources(job_id),
  version integer NOT NULL DEFAULT 1 CHECK (version>0),
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','running','ready','failed','withdrawn')),
  target text NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts>=0),
  lease_token uuid, lease_until timestamptz,
  checked_at timestamptz, error text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK ((service='platform' AND municipality_id IS NULL AND binding_id IS NULL AND job_id IS NULL)
    OR (service='commandmaps' AND municipality_id IS NOT NULL AND binding_id IS NOT NULL AND job_id IS NOT NULL)),
  CHECK (state<>'running' OR (lease_token IS NOT NULL AND lease_until IS NOT NULL)),
  CHECK ((lease_token IS NULL)=(lease_until IS NULL))
);
CREATE TABLE service_route_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, route_id uuid NOT NULL REFERENCES service_routes(id),
  version integer NOT NULL, action text NOT NULL, actor text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE sessions ADD COLUMN route_id uuid REFERENCES service_routes(id);
ALTER TABLE sessions ADD COLUMN route_version integer;
ALTER TABLE platform_sessions ADD COLUMN route_id uuid REFERENCES service_routes(id);
ALTER TABLE platform_sessions ADD COLUMN route_version integer;
GRANT SELECT ON service_routes TO civicmaps_platform_app;
GRANT UPDATE (state,version,attempts,lease_token,lease_until,checked_at,error) ON service_routes TO civicmaps_platform_app;
GRANT INSERT ON service_route_events TO civicmaps_platform_app;
GRANT USAGE ON SEQUENCE service_route_events_id_seq TO civicmaps_platform_app;
-- Runtime/council roles cannot author route ownership or context bindings.
