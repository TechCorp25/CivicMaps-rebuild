-- One synthetic lifecycle per registration. Retry/reconcile retain the same job.
CREATE TABLE provisioning_jobs (
  id uuid PRIMARY KEY, municipality_id uuid NOT NULL UNIQUE REFERENCES platform_municipalities(id),
  operator_id uuid NOT NULL REFERENCES platform_operators(id),
  adapter text NOT NULL DEFAULT 'synthetic' CHECK (adapter='synthetic'),
  state text NOT NULL DEFAULT 'queued' CHECK (state IN ('queued','running','waiting','failed','succeeded')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts>=0),
  available_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  lease_token uuid, lease_until timestamptz,
  error text, created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK ((state='running')=(lease_token IS NOT NULL AND lease_until IS NOT NULL)),
  CHECK ((lease_token IS NULL)=(lease_until IS NULL))
);
CREATE INDEX provisioning_queue ON provisioning_jobs(available_at,created_at) WHERE state IN ('queued','waiting','running');
CREATE TABLE provisioning_steps (
  job_id uuid NOT NULL REFERENCES provisioning_jobs(id),
  name text NOT NULL CHECK (name IN ('prepare_workspace','prepare_services')),
  position integer NOT NULL CHECK (position IN (1,2)),
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','running','failed','succeeded')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 3),
  resource_id text, error text, completed_at timestamptz,
  PRIMARY KEY(job_id,name), UNIQUE(job_id,position),
  CHECK ((state='succeeded')=(resource_id IS NOT NULL AND completed_at IS NOT NULL))
);
-- Effects are the fake provider's durable state, independent of worker checkpoints.
CREATE TABLE synthetic_provisioning_effects (
  job_id uuid NOT NULL, step_name text NOT NULL, resource_id text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY(job_id,step_name), FOREIGN KEY(job_id,step_name) REFERENCES provisioning_steps(job_id,name)
);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='civicmaps_provisioning_worker') THEN
    CREATE ROLE civicmaps_provisioning_worker NOLOGIN NOSUPERUSER NOBYPASSRLS;
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO civicmaps_provisioning_worker;
GRANT SELECT,INSERT,UPDATE ON provisioning_jobs,provisioning_steps TO civicmaps_platform_app;
GRANT SELECT,UPDATE ON provisioning_jobs,provisioning_steps TO civicmaps_provisioning_worker;
GRANT SELECT,INSERT ON synthetic_provisioning_effects TO civicmaps_provisioning_worker;
GRANT INSERT ON platform_audit TO civicmaps_provisioning_worker;
GRANT USAGE ON SEQUENCE platform_audit_id_seq TO civicmaps_provisioning_worker;
-- Neither council role nor worker can read admin passwords/operational data.
