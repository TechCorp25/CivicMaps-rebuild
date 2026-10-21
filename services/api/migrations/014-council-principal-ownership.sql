-- Staged owner/session fields. migrate.mjs loads and validates the explicit fixture
-- manifest in this same transaction before migration 015 adds enforcement.
CREATE TABLE council_principal_owners (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  municipality_id uuid NOT NULL REFERENCES platform_municipalities(id),
  assigned_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (user_id, municipality_id)
);
ALTER TABLE sessions ADD COLUMN municipality_id uuid REFERENCES platform_municipalities(id);
ALTER TABLE sessions ADD CONSTRAINT session_owner_pair UNIQUE (user_id, municipality_id);
CREATE INDEX sessions_owner_idx ON sessions(user_id, municipality_id);

CREATE FUNCTION immutable_principal_owner() RETURNS trigger LANGUAGE plpgsql
SET search_path=pg_catalog,public AS $$
BEGIN
  IF TG_OP='DELETE' OR NEW.user_id IS DISTINCT FROM OLD.user_id
    OR NEW.municipality_id IS DISTINCT FROM OLD.municipality_id THEN
    RAISE EXCEPTION 'Council principal ownership is immutable';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER council_principal_owner_immutable BEFORE UPDATE OR DELETE ON council_principal_owners
  FOR EACH ROW EXECUTE FUNCTION immutable_principal_owner();

CREATE FUNCTION validate_context_grant_owner() RETURNS trigger LANGUAGE plpgsql
SET search_path=pg_catalog,public AS $$
DECLARE owner_municipality uuid; binding_municipality uuid;
BEGIN
  IF TG_OP='UPDATE' AND OLD.revoked_at IS NULL AND NEW.revoked_at IS NOT NULL
    AND ROW(NEW.user_id,NEW.binding_id,NEW.effective_from,NEW.effective_to)
      IS NOT DISTINCT FROM ROW(OLD.user_id,OLD.binding_id,OLD.effective_from,OLD.effective_to) THEN
    -- Revoking a known legacy mismatch preserves its pair/history while ending authority.
    RETURN NEW;
  END IF;
  SELECT municipality_id INTO owner_municipality FROM public.council_principal_owners WHERE user_id=NEW.user_id FOR KEY SHARE;
  SELECT municipality_id INTO binding_municipality FROM public.operating_context_bindings WHERE id=NEW.binding_id FOR KEY SHARE;
  IF owner_municipality IS NULL OR binding_municipality IS NULL OR owner_municipality<>binding_municipality THEN
    RAISE EXCEPTION 'Operating context grant does not match council principal owner';
  END IF;
  RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER context_grant_owner AFTER INSERT OR UPDATE ON operating_context_grants
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION validate_context_grant_owner();

REVOKE ALL ON council_principal_owners FROM PUBLIC, civicmaps_local_app, civicmaps_platform_app;
GRANT SELECT ON council_principal_owners TO civicmaps_local_app;
ALTER TABLE council_principal_owners ENABLE ROW LEVEL SECURITY;
CREATE POLICY principal_owner_actor ON council_principal_owners TO civicmaps_local_app
  USING(user_id::text=current_setting('civicmaps.actor',true));
CREATE TABLE council_principal_owner_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL,
  municipality_id uuid NOT NULL,
  database_actor text NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE FUNCTION record_principal_owner_assignment() RETURNS trigger LANGUAGE plpgsql
SET search_path=pg_catalog,public AS $$
BEGIN
  INSERT INTO public.council_principal_owner_events(user_id,municipality_id,database_actor)
  VALUES(NEW.user_id,NEW.municipality_id,session_user);
  RETURN NEW;
END $$;
CREATE TRIGGER principal_owner_assignment AFTER INSERT ON council_principal_owners
  FOR EACH ROW EXECUTE FUNCTION record_principal_owner_assignment();
REVOKE ALL ON council_principal_owner_events FROM PUBLIC, civicmaps_local_app, civicmaps_platform_app;
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='civicmaps_f06_runtime') THEN
    REVOKE ALL ON council_principal_owners,council_principal_owner_events FROM civicmaps_f06_runtime;
    GRANT SELECT ON council_principal_owners TO civicmaps_f06_runtime;
  END IF;
END $$;

-- Keep the existing D02 token transition intact, then assign the owner in the
-- same transaction. The deferred grant check sees both committed transitions.
ALTER FUNCTION civicmaps_redeem_admin(uuid,uuid,text,text,uuid) RENAME TO civicmaps_redeem_admin_without_owner;
CREATE FUNCTION civicmaps_redeem_admin(p_municipality uuid,p_binding uuid,p_hash text,p_password_hash text,p_route uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE result jsonb; activated_user uuid;
BEGIN
  result:=public.civicmaps_redeem_admin_without_owner(p_municipality,p_binding,p_hash,p_password_hash,p_route);
  IF result->>'ok'='true' THEN
    SELECT user_id INTO activated_user FROM public.platform_first_admins WHERE municipality_id=p_municipality;
    IF activated_user IS NULL THEN RAISE EXCEPTION 'D02 activation did not assign a principal'; END IF;
    INSERT INTO public.council_principal_owners(user_id,municipality_id) VALUES(activated_user,p_municipality);
  END IF;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION civicmaps_redeem_admin(uuid,uuid,text,text,uuid),
  civicmaps_redeem_admin_without_owner(uuid,uuid,text,text,uuid) FROM PUBLIC, civicmaps_local_app, civicmaps_platform_app;
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='civicmaps_f06_runtime') THEN
    REVOKE ALL ON FUNCTION civicmaps_redeem_admin_without_owner(uuid,uuid,text,text,uuid) FROM civicmaps_f06_runtime;
    GRANT EXECUTE ON FUNCTION civicmaps_redeem_admin(uuid,uuid,text,text,uuid) TO civicmaps_f06_runtime;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.valid_operating_context() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.operating_context_bindings b
    JOIN public.operating_context_grants g ON g.binding_id=b.id
    JOIN public.users u ON u.id=g.user_id
    JOIN public.council_principal_owners o ON o.user_id=u.id AND o.municipality_id=b.municipality_id
    WHERE b.id::text=current_setting('civicmaps.context',true)
      AND u.id::text=current_setting('civicmaps.actor',true) AND u.active
      AND b.tenant_id=current_setting('civicmaps.tenant',true)
      AND b.organisation_id=current_setting('civicmaps.organisation',true)
      AND b.jurisdiction_id=current_setting('civicmaps.jurisdiction',true)
      AND b.data_plane_id=current_setting('civicmaps.plane',true)
      AND b.branch_id=current_setting('civicmaps.branch',true)
      AND b.revoked_at IS NULL AND g.revoked_at IS NULL
      AND b.effective_from<=statement_timestamp() AND (b.effective_to IS NULL OR b.effective_to>statement_timestamp())
      AND g.effective_from<=statement_timestamp() AND (g.effective_to IS NULL OR g.effective_to>statement_timestamp())
  );
$$;
