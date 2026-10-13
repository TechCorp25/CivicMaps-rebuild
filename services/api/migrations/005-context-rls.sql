-- Keep binding, actor and row scope consistent even when SQL callers omit the resolver.
-- The existing privileged migration/resolver owner reads control-plane rows without
-- invoking their application policies recursively. Expose only a boolean to the app.
CREATE FUNCTION public.valid_operating_context() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.operating_context_bindings b
    JOIN public.operating_context_grants g ON g.binding_id=b.id
    JOIN public.users u ON u.id=g.user_id
    WHERE b.id::text=current_setting('civicmaps.context',true)
      AND u.id::text=current_setting('civicmaps.actor',true) AND u.active
      AND b.tenant_id=current_setting('civicmaps.tenant',true)
      AND b.organisation_id=current_setting('civicmaps.organisation',true)
      AND b.jurisdiction_id=current_setting('civicmaps.jurisdiction',true)
      AND b.data_plane_id=current_setting('civicmaps.plane',true)
      AND b.branch_id=current_setting('civicmaps.branch',true)
      AND b.revoked_at IS NULL AND g.revoked_at IS NULL
      AND b.effective_from<=statement_timestamp()
      AND (b.effective_to IS NULL OR b.effective_to>statement_timestamp())
      AND g.effective_from<=statement_timestamp()
      AND (g.effective_to IS NULL OR g.effective_to>statement_timestamp())
  );
$$;
REVOKE ALL ON FUNCTION public.valid_operating_context() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.valid_operating_context() TO civicmaps_local_app;
-- Restrictive policies AND with existing row/actor filters; USING also supplies
-- WITH CHECK for inserts/updates. Captured historical bindings need not be current.
CREATE POLICY resolved_context ON service_requests AS RESTRICTIVE TO civicmaps_local_app
  USING ((SELECT public.valid_operating_context()));
CREATE POLICY resolved_context ON audit_events AS RESTRICTIVE TO civicmaps_local_app
  USING ((SELECT public.valid_operating_context()));
CREATE POLICY resolved_context ON users AS RESTRICTIVE TO civicmaps_local_app
  USING ((SELECT public.valid_operating_context()));
CREATE POLICY resolved_context ON operating_context_grants AS RESTRICTIVE TO civicmaps_local_app
  USING ((SELECT public.valid_operating_context()));
CREATE POLICY resolved_context ON mutation_receipts AS RESTRICTIVE TO civicmaps_local_app
  USING ((SELECT public.valid_operating_context()));
CREATE POLICY resolved_context ON legacy_mutation_keys AS RESTRICTIVE TO civicmaps_local_app
  USING ((SELECT public.valid_operating_context()));
