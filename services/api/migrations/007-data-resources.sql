-- Historical synthetic jobs keep their adapter and effects; only new configured jobs use AWS.
ALTER TABLE provisioning_jobs DROP CONSTRAINT provisioning_jobs_adapter_check;
ALTER TABLE provisioning_jobs ADD CONSTRAINT provisioning_jobs_adapter_check CHECK (adapter IN ('synthetic','aws-postgres-s3'));
ALTER TABLE provisioning_jobs ADD COLUMN profile text;
ALTER TABLE provisioning_jobs ADD CONSTRAINT provisioning_profile CHECK ((adapter='synthetic' AND profile IS NULL) OR (adapter='aws-postgres-s3' AND profile='aws-sydney-development'));
CREATE TABLE municipality_resources (
  job_id uuid PRIMARY KEY REFERENCES provisioning_jobs(id),
  municipality_id uuid NOT NULL UNIQUE REFERENCES platform_municipalities(id),
  profile text NOT NULL CHECK (profile='aws-sydney-development'),
  database_name text NOT NULL UNIQUE CHECK (database_name ~ '^civicmaps_[0-9a-f]{32}$'),
  runtime_name text NOT NULL UNIQUE CHECK (runtime_name ~ '^runtime_[0-9a-f]{32}$'),
  secret_ref text NOT NULL UNIQUE,
  storage_prefix text NOT NULL UNIQUE,
  schema_version integer NOT NULL DEFAULT 0 CHECK (schema_version>=0),
  disabled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
GRANT SELECT ON municipality_resources TO civicmaps_platform_app;
GRANT SELECT,INSERT,UPDATE ON municipality_resources TO civicmaps_provisioning_worker;
-- Council SQL roles cannot read the registry or secret references directly.

CREATE TABLE municipality_resource_contexts (
  job_id uuid NOT NULL REFERENCES municipality_resources(job_id),
  binding_id uuid NOT NULL UNIQUE REFERENCES operating_context_bindings(id),
  PRIMARY KEY (job_id,binding_id)
);
-- Structural writer explicitly binds each immutable context version to its resource.
-- No runtime or worker grants: provisioning cannot grant access to itself.
