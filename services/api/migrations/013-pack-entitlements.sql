-- D03: stable identities, explicit development enablement and transactional pack policy.
CREATE TABLE pack_catalogue (id text PRIMARY KEY, label text UNIQUE NOT NULL, position integer UNIQUE NOT NULL);
INSERT INTO pack_catalogue VALUES
 ('parking-services','Parking Services Branch',0),('local-laws','Local Laws',1),
 ('parks-gardens','Parks & Gardens',2),('animal-management','Animal Management',3),
 ('cleaning','Cleaning',4),('waste','Waste',5),('safe-city','Safe City',6),
 ('licensing-permits','Licensing / Permits',7),('asset-inspections','Asset Inspections',8);
CREATE TABLE pack_legacy_labels (label text PRIMARY KEY, pack_id text NOT NULL REFERENCES pack_catalogue(id));
INSERT INTO pack_legacy_labels SELECT label,id FROM pack_catalogue;
CREATE TABLE branch_pack_mapping (branch_id text PRIMARY KEY, pack_id text NOT NULL REFERENCES pack_catalogue(id));
INSERT INTO branch_pack_mapping SELECT id,id FROM pack_catalogue;
INSERT INTO branch_pack_mapping VALUES ('parking','parking-services');
GRANT SELECT ON pack_catalogue,pack_legacy_labels,branch_pack_mapping TO civicmaps_platform_app;

CREATE FUNCTION civicmaps_normalise_packs(packs jsonb) RETURNS jsonb LANGUAGE plpgsql
SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE result jsonb; input_count integer;
BEGIN
 IF jsonb_typeof(packs) IS DISTINCT FROM 'array' OR EXISTS(SELECT 1 FROM jsonb_array_elements(packs) v WHERE jsonb_typeof(v)<>'string') THEN
  RAISE EXCEPTION 'Expected an array of catalogue pack IDs' USING ERRCODE='22023'; END IF;
 SELECT coalesce(jsonb_agg(p.id ORDER BY v.ordinality),'[]'::jsonb),count(DISTINCT p.id)
 INTO result,input_count FROM jsonb_array_elements_text(packs) WITH ORDINALITY v(value,ordinality)
 LEFT JOIN public.pack_legacy_labels a ON a.label=v.value
 LEFT JOIN public.pack_catalogue p ON p.id=coalesce(a.pack_id,v.value);
 IF input_count<>jsonb_array_length(packs) THEN
  RAISE EXCEPTION 'Unknown or duplicate catalogue pack' USING ERRCODE='22023'; END IF;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION civicmaps_normalise_packs(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION civicmaps_normalise_packs(jsonb) TO civicmaps_platform_app;
ALTER TABLE platform_municipalities ADD COLUMN pack_version integer NOT NULL DEFAULT 1 CHECK(pack_version>0);
UPDATE platform_municipalities SET packs=civicmaps_normalise_packs(packs);
-- Owner explicitly approved only these retained fixtures. Local Laws is not a parking alias.
UPDATE platform_municipalities SET packs=packs || '["parking-services"]'::jsonb
 WHERE id IN ('20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002')
 AND NOT packs ? 'parking-services';
UPDATE platform_municipalities SET version=version+1;
UPDATE platform_pack_workload w SET pack=coalesce((SELECT pack_id FROM pack_legacy_labels WHERE label=w.pack),w.pack);
CREATE TABLE municipality_pack_history (
 municipality_id uuid NOT NULL REFERENCES platform_municipalities(id), version integer NOT NULL,
 packs jsonb NOT NULL, operator_id uuid REFERENCES platform_operators(id),
 database_actor text NOT NULL, reason text NOT NULL, recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(municipality_id,version)
);
INSERT INTO municipality_pack_history(municipality_id,version,packs,database_actor,reason)
 SELECT id,pack_version,packs,session_user,'catalogue_migration_and_explicit_fixture_policy' FROM platform_municipalities;
GRANT SELECT ON municipality_pack_history TO civicmaps_platform_app;
CREATE FUNCTION civicmaps_pack_version() RETURNS trigger LANGUAGE plpgsql
SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
 NEW.packs=public.civicmaps_normalise_packs(NEW.packs);
 IF TG_OP='INSERT' THEN NEW.pack_version=1;
 ELSIF NEW.packs IS DISTINCT FROM OLD.packs THEN
  NEW.pack_version=OLD.pack_version+1; NEW.version=OLD.version+1;
 ELSIF NEW.pack_version IS DISTINCT FROM OLD.pack_version THEN
  RAISE EXCEPTION 'Entitlement versions cannot be rewritten';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER pack_version BEFORE INSERT OR UPDATE ON platform_municipalities FOR EACH ROW EXECUTE FUNCTION civicmaps_pack_version();
CREATE FUNCTION civicmaps_pack_history() RETURNS trigger LANGUAGE plpgsql
SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE actor uuid;
BEGIN
 IF TG_OP='INSERT' OR NEW.packs IS DISTINCT FROM OLD.packs THEN
  SELECT id INTO actor FROM public.platform_operators WHERE id::text=current_setting('civicmaps.operator',true) AND active;
  INSERT INTO public.municipality_pack_history(municipality_id,version,packs,operator_id,database_actor,reason)
   VALUES(NEW.id,NEW.pack_version,NEW.packs,actor,session_user,CASE WHEN TG_OP='INSERT' THEN 'registration' ELSE 'pack_change' END);
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER pack_history AFTER INSERT OR UPDATE ON platform_municipalities FOR EACH ROW EXECUTE FUNCTION civicmaps_pack_history();

CREATE FUNCTION civicmaps_entitlement_state() RETURNS jsonb LANGUAGE plpgsql VOLATILE
SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE result jsonb;
BEGIN
 -- FOR SHARE conflicts with the operator's municipality UPDATE and lasts to commit.
 -- Effective grants and context, rather than client-supplied capability flags, select the pack.
 SELECT jsonb_build_object('packId',p.id,'label',p.label,'version',m.pack_version,
  'enabled',m.packs ? p.id,'known',true,'operational',u.role<>'ADMIN') INTO result
 FROM public.operating_context_bindings b
 JOIN public.operating_context_grants g ON g.binding_id=b.id
 JOIN public.users u ON u.id=g.user_id
 JOIN public.platform_municipalities m ON m.id=b.municipality_id
 JOIN public.branch_pack_mapping mapping ON mapping.branch_id=b.branch_id
 JOIN public.pack_catalogue p ON p.id=mapping.pack_id
 WHERE b.id::text=current_setting('civicmaps.context',true) AND u.id::text=current_setting('civicmaps.actor',true)
 AND u.active AND b.revoked_at IS NULL AND g.revoked_at IS NULL
 AND b.effective_from<=clock_timestamp() AND (b.effective_to IS NULL OR b.effective_to>clock_timestamp())
 AND g.effective_from<=clock_timestamp() AND (g.effective_to IS NULL OR g.effective_to>clock_timestamp())
 FOR SHARE OF m;
 RETURN coalesce(result,'{"known":false,"enabled":false,"operational":false,"packId":null,"version":null}'::jsonb);
END $$;
CREATE FUNCTION civicmaps_pack_access(mutating boolean) RETURNS boolean LANGUAGE sql VOLATILE
SET search_path=pg_catalog,public AS $$
 WITH state AS MATERIALIZED (SELECT public.civicmaps_entitlement_state() s)
 SELECT (s->>'known')::boolean AND (s->>'operational')::boolean AND (NOT mutating OR (s->>'enabled')::boolean) FROM state;
$$;
REVOKE ALL ON FUNCTION civicmaps_entitlement_state(),civicmaps_pack_access(boolean),civicmaps_pack_version(),civicmaps_pack_history() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION civicmaps_entitlement_state(),civicmaps_pack_access(boolean) TO civicmaps_local_app;
CREATE POLICY pack_request_read ON service_requests AS RESTRICTIVE FOR SELECT TO civicmaps_local_app USING(public.civicmaps_pack_access(false));
CREATE POLICY pack_request_insert ON service_requests AS RESTRICTIVE FOR INSERT TO civicmaps_local_app WITH CHECK(public.civicmaps_pack_access(true));
CREATE POLICY pack_request_update ON service_requests AS RESTRICTIVE FOR UPDATE TO civicmaps_local_app USING(public.civicmaps_pack_access(true)) WITH CHECK(public.civicmaps_pack_access(true));
CREATE POLICY pack_request_delete ON service_requests AS RESTRICTIVE FOR DELETE TO civicmaps_local_app USING(public.civicmaps_pack_access(true));
CREATE POLICY pack_audit_read ON audit_events AS RESTRICTIVE FOR SELECT TO civicmaps_local_app USING(public.civicmaps_pack_access(false));
CREATE POLICY pack_audit_write ON audit_events AS RESTRICTIVE FOR INSERT TO civicmaps_local_app WITH CHECK(public.civicmaps_pack_access(true));
CREATE POLICY pack_receipt_read ON mutation_receipts AS RESTRICTIVE FOR SELECT TO civicmaps_local_app USING(public.civicmaps_pack_access(false));
CREATE POLICY pack_receipt_write ON mutation_receipts AS RESTRICTIVE FOR INSERT TO civicmaps_local_app WITH CHECK(public.civicmaps_pack_access(true));
CREATE POLICY pack_personnel_read ON users AS RESTRICTIVE FOR SELECT TO civicmaps_local_app USING(id::text=current_setting('civicmaps.actor',true) OR public.civicmaps_pack_access(true));
