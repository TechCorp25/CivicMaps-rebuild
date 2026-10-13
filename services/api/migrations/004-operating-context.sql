-- Binding versions are immutable snapshots; revoke and append rather than rewriting scope.
CREATE TABLE operating_context_bindings (
  id uuid PRIMARY KEY, association_id uuid NOT NULL, version integer NOT NULL CHECK (version > 0),
  municipality_id uuid NOT NULL REFERENCES platform_municipalities(id),
  tenant_id text NOT NULL CHECK (length(tenant_id)>0), organisation_id text NOT NULL CHECK (length(organisation_id)>0),
  jurisdiction_id text NOT NULL CHECK (length(jurisdiction_id)>0), data_plane_id text NOT NULL CHECK (length(data_plane_id)>0),
  branch_id text NOT NULL CHECK (length(branch_id)>0),
  effective_from timestamptz NOT NULL, effective_to timestamptz,
  revoked_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (effective_to IS NULL OR effective_to > effective_from),
  UNIQUE (association_id,version), UNIQUE (id,version), UNIQUE (id,association_id)
);
CREATE TABLE operating_context_grants (
  user_id uuid NOT NULL REFERENCES users(id), binding_id uuid NOT NULL REFERENCES operating_context_bindings(id),
  effective_from timestamptz NOT NULL, effective_to timestamptz, revoked_at timestamptz,
  PRIMARY KEY (user_id,binding_id), CHECK (effective_to IS NULL OR effective_to > effective_from)
);
CREATE TABLE operating_context_changes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, table_name text NOT NULL, action text NOT NULL,
  database_actor text NOT NULL, changed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  before_state jsonb, after_state jsonb
);
CREATE FUNCTION retain_context_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Context history cannot be deleted'; END IF;
  IF TG_OP='UPDATE' THEN
    IF (to_jsonb(NEW)-'revoked_at') IS DISTINCT FROM (to_jsonb(OLD)-'revoked_at')
      OR OLD.revoked_at IS NOT NULL THEN
      RAISE EXCEPTION 'Context history is immutable; revoke and append a new version';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER binding_history BEFORE UPDATE OR DELETE ON operating_context_bindings
  FOR EACH ROW EXECUTE FUNCTION retain_context_history();
CREATE TRIGGER grant_history BEFORE UPDATE OR DELETE ON operating_context_grants
  FOR EACH ROW EXECUTE FUNCTION retain_context_history();
CREATE FUNCTION record_context_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO operating_context_changes(table_name,action,database_actor,before_state,after_state)
    VALUES (TG_TABLE_NAME,TG_OP,current_user,CASE WHEN TG_OP='UPDATE' THEN to_jsonb(OLD) ELSE NULL END,to_jsonb(NEW));
  RETURN NEW;
END $$;
-- AFTER fires only for persisted inserts; BEFORE would audit ON CONFLICT DO NOTHING attempts.
CREATE TRIGGER binding_change AFTER INSERT OR UPDATE ON operating_context_bindings
  FOR EACH ROW EXECUTE FUNCTION record_context_change();
CREATE TRIGGER grant_change AFTER INSERT OR UPDATE ON operating_context_grants
  FOR EACH ROW EXECUTE FUNCTION record_context_change();
-- Only the privileged structural writer can author bindings/grants. App roles cannot edit them.
GRANT SELECT ON operating_context_grants TO civicmaps_local_app;
ALTER TABLE operating_context_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_context_grants FORCE ROW LEVEL SECURITY;
CREATE POLICY context_grant_scope ON operating_context_grants TO civicmaps_local_app USING (
  binding_id::text = current_setting('civicmaps.context',true)
  AND revoked_at IS NULL AND effective_from <= statement_timestamp()
  AND (effective_to IS NULL OR effective_to > statement_timestamp())
);
DROP POLICY user_scope ON users;
CREATE POLICY user_scope ON users TO civicmaps_local_app USING (
  EXISTS (SELECT 1 FROM operating_context_grants g WHERE g.user_id=users.id)
);
ALTER TABLE service_requests ADD COLUMN capture_binding_id uuid;
ALTER TABLE service_requests ADD COLUMN capture_binding_version integer;
ALTER TABLE service_requests ADD CONSTRAINT capture_binding_reference FOREIGN KEY (capture_binding_id,capture_binding_version)
  REFERENCES operating_context_bindings(id,version) MATCH FULL;
-- Historical records keep NULL capture metadata; no invented backfill/provenance.
CREATE FUNCTION preserve_request_origin() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE binding operating_context_bindings;
BEGIN
  IF TG_OP='UPDATE' THEN
    IF ROW(NEW.tenant_id,NEW.organisation_id,NEW.jurisdiction_id,NEW.data_plane_id,NEW.branch_id,NEW.capture_binding_id,NEW.capture_binding_version)
      IS DISTINCT FROM ROW(OLD.tenant_id,OLD.organisation_id,OLD.jurisdiction_id,OLD.data_plane_id,OLD.branch_id,OLD.capture_binding_id,OLD.capture_binding_version)
      THEN RAISE EXCEPTION 'Operational origin and capture binding are immutable'; END IF;
  ELSE
    IF NEW.capture_binding_id IS NULL THEN RAISE EXCEPTION 'Resolved capture binding is required'; END IF;
    SELECT * INTO binding FROM operating_context_bindings WHERE id=NEW.capture_binding_id AND version=NEW.capture_binding_version;
    IF NOT FOUND OR ROW(NEW.tenant_id,NEW.organisation_id,NEW.jurisdiction_id,NEW.data_plane_id,NEW.branch_id)
      IS DISTINCT FROM ROW(binding.tenant_id,binding.organisation_id,binding.jurisdiction_id,binding.data_plane_id,binding.branch_id)
      THEN RAISE EXCEPTION 'Capture binding does not match operational origin'; END IF;
  END IF;
  RETURN NEW;
END $$;
-- Invoker app role cannot read the control-plane binding table. A narrow definer trigger checks inserts.
ALTER FUNCTION preserve_request_origin() SECURITY DEFINER;
ALTER FUNCTION preserve_request_origin() SET search_path = pg_catalog, public;
REVOKE ALL ON FUNCTION preserve_request_origin() FROM PUBLIC;
CREATE TRIGGER request_origin BEFORE INSERT OR UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION preserve_request_origin();
ALTER TABLE mutation_receipts ADD COLUMN binding_id uuid REFERENCES operating_context_bindings(id);
ALTER TABLE mutation_receipts ADD COLUMN association_id uuid;
ALTER TABLE mutation_receipts ADD CONSTRAINT receipt_binding_association FOREIGN KEY (binding_id,association_id)
  REFERENCES operating_context_bindings(id,association_id) MATCH FULL;
ALTER TABLE mutation_receipts DROP CONSTRAINT mutation_receipts_pkey;
-- A replacement version in the same association must not silently repeat a prior write.
ALTER TABLE mutation_receipts ADD CONSTRAINT receipt_association_key UNIQUE (actor_id,association_id,key);
-- A legacy key cannot safely be assigned a context or reused to create a duplicate.
CREATE TABLE legacy_mutation_keys (actor_id uuid NOT NULL REFERENCES users(id), key text NOT NULL, PRIMARY KEY(actor_id,key));
INSERT INTO legacy_mutation_keys SELECT actor_id,key FROM mutation_receipts WHERE binding_id IS NULL;
GRANT SELECT ON legacy_mutation_keys TO civicmaps_local_app;
ALTER TABLE legacy_mutation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_mutation_keys FORCE ROW LEVEL SECURITY;
CREATE POLICY legacy_key_actor ON legacy_mutation_keys TO civicmaps_local_app USING (
  actor_id::text=current_setting('civicmaps.actor',true)
);
-- Legacy receipts stay preserved but unreplayable; NULL never matches a resolved context.
CREATE UNIQUE INDEX context_receipt_key ON mutation_receipts(actor_id,binding_id,key) NULLS NOT DISTINCT;
DROP POLICY receipt_actor ON mutation_receipts;
CREATE POLICY receipt_actor_context ON mutation_receipts TO civicmaps_local_app USING (
  actor_id::text=current_setting('civicmaps.actor',true)
  AND binding_id::text=current_setting('civicmaps.context',true)
);
