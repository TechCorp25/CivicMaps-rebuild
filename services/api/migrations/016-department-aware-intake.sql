ALTER TABLE service_requests
  ADD COLUMN origin_binding_id uuid REFERENCES operating_context_bindings(id),
  ADD COLUMN package_id text,
  ADD COLUMN package_schema_version integer,
  ADD COLUMN package_payload jsonb,
  ADD COLUMN assignment_state text,
  ADD COLUMN assignment_exception text;

ALTER TABLE service_requests
  ADD CONSTRAINT service_request_package_shape CHECK (
    (package_id IS NULL AND package_schema_version IS NULL AND package_payload IS NULL)
    OR (package_id IS NOT NULL AND package_schema_version IS NOT NULL AND package_schema_version > 0
      AND package_payload IS NOT NULL AND jsonb_typeof(package_payload)='object')
  ),
  ADD CONSTRAINT service_request_assignment_state CHECK (
    assignment_state IS NULL OR assignment_state IN ('assigned','unassigned')
  );

GRANT SELECT, INSERT, UPDATE ON service_requests TO civicmaps_local_app;
