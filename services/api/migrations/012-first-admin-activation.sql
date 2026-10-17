-- D02: one designated administrator, one explicit context, no operational privileges.
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('DISPATCHER','OFFICER','SUPERVISOR','ADMIN'));
ALTER TABLE platform_first_admins ADD COLUMN user_id uuid UNIQUE REFERENCES users(id);
ALTER TABLE platform_first_admins ADD COLUMN binding_id uuid REFERENCES operating_context_bindings(id);
ALTER TABLE platform_first_admins ADD CONSTRAINT first_admin_state CHECK (activation_state IN ('Pending','Activated','Disabled'));
CREATE TABLE council_admin_activations (
  id uuid PRIMARY KEY, municipality_id uuid NOT NULL REFERENCES platform_first_admins(municipality_id),
  binding_id uuid NOT NULL REFERENCES operating_context_bindings(id),
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  issued_by uuid NOT NULL REFERENCES platform_operators(id),
  issued_at timestamptz NOT NULL DEFAULT clock_timestamp(), expires_at timestamptz NOT NULL,
  redeemed_at timestamptz, revoked_at timestamptz,
  CHECK (expires_at>issued_at)
);
CREATE TABLE council_admin_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  municipality_id uuid REFERENCES platform_municipalities(id),
  operator_id uuid REFERENCES platform_operators(id), user_id uuid REFERENCES users(id),
  action text NOT NULL, recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
-- App roles cannot write identities, grants or token tables directly. The structural
-- writer exposes only these scoped transitions, with fixed search paths and no PUBLIC access.
CREATE FUNCTION civicmaps_admin_status(p_municipality uuid) RETURNS jsonb LANGUAGE sql
SECURITY DEFINER SET search_path=pg_catalog,public AS $$
  SELECT jsonb_build_object('state',a.activation_state,'email',a.email,'bindingId',a.binding_id,
    'contexts',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',b.id,'version',b.version,
      'label',b.organisation_id || ' / ' || b.branch_id)) FROM public.operating_context_bindings b
      WHERE b.municipality_id=a.municipality_id AND b.revoked_at IS NULL
      AND b.effective_from<=clock_timestamp() AND (b.effective_to IS NULL OR b.effective_to>clock_timestamp())),'[]'::jsonb),
    'latest', (SELECT jsonb_build_object('id',t.id,'expiresAt',t.expires_at,'state',
      CASE WHEN t.redeemed_at IS NOT NULL THEN 'Used' WHEN t.revoked_at IS NOT NULL THEN 'Revoked'
      WHEN t.expires_at<=clock_timestamp() THEN 'Expired' ELSE 'Pending' END)
      FROM public.council_admin_activations t WHERE t.municipality_id=a.municipality_id
      ORDER BY t.issued_at DESC LIMIT 1))
  FROM public.platform_first_admins a WHERE a.municipality_id=p_municipality;
$$;
CREATE FUNCTION civicmaps_issue_admin(p_municipality uuid,p_binding uuid,p_operator uuid,p_email text,p_id uuid,p_hash text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE a public.platform_first_admins; b public.operating_context_bindings; expiry timestamptz;
BEGIN
  SELECT * INTO a FROM public.platform_first_admins WHERE municipality_id=p_municipality FOR UPDATE;
  IF NOT FOUND OR a.activation_state<>'Pending' OR a.user_id IS NOT NULL THEN
    RAISE EXCEPTION 'Administrator is not pending' USING ERRCODE='22023'; END IF;
  IF lower(trim(p_email))<>lower(a.email) OR NOT EXISTS(SELECT 1 FROM public.platform_operators WHERE id=p_operator AND active)
    THEN RAISE EXCEPTION 'Recipient verification required' USING ERRCODE='22023'; END IF;
  SELECT * INTO b FROM public.operating_context_bindings WHERE id=p_binding AND municipality_id=p_municipality FOR SHARE;
  IF NOT FOUND OR b.revoked_at IS NOT NULL OR b.effective_from>clock_timestamp()
    OR b.effective_to<=clock_timestamp() OR EXISTS(SELECT 1 FROM public.platform_municipalities WHERE id=p_municipality AND status='Suspended')
    OR EXISTS(SELECT 1 FROM public.users WHERE email=lower(a.email)) THEN
    RAISE EXCEPTION 'Administrator context unavailable or email already in use' USING ERRCODE='22023'; END IF;
  UPDATE public.council_admin_activations SET revoked_at=clock_timestamp()
    WHERE municipality_id=p_municipality AND redeemed_at IS NULL AND revoked_at IS NULL;
  expiry=clock_timestamp()+interval '24 hours';
  INSERT INTO public.council_admin_activations(id,municipality_id,binding_id,token_hash,issued_by,expires_at)
    VALUES(p_id,p_municipality,p_binding,p_hash,p_operator,expiry);
  INSERT INTO public.council_admin_events(municipality_id,operator_id,action) VALUES(p_municipality,p_operator,'activation-issued');
  RETURN jsonb_build_object('id',p_id,'municipalityId',p_municipality,'bindingId',p_binding,'expiresAt',expiry);
END $$;
CREATE FUNCTION civicmaps_redeem_admin(p_municipality uuid,p_binding uuid,p_hash text,p_password_hash text,p_route uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE t public.council_admin_activations; a public.platform_first_admins; b public.operating_context_bindings; new_user uuid;
BEGIN
  -- All transitions take the designated-admin lock before token/user locks. Reissue
  -- and concurrent redemption therefore observe a single committed activation state.
  SELECT * INTO a FROM public.platform_first_admins WHERE municipality_id=p_municipality FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.council_admin_events(action) VALUES('activation-rejected');
    RETURN jsonb_build_object('error','Activation link is unavailable','status',400); END IF;
  SELECT * INTO t FROM public.council_admin_activations WHERE token_hash=p_hash
    AND municipality_id=p_municipality AND binding_id=p_binding FOR UPDATE;
  IF NOT FOUND OR t.revoked_at IS NOT NULL OR t.redeemed_at IS NOT NULL OR a.activation_state<>'Pending' THEN
    INSERT INTO public.council_admin_events(municipality_id,action) VALUES(p_municipality,'activation-rejected');
    RETURN jsonb_build_object('error','Activation link is used, revoked or unavailable','status',409); END IF;
  IF t.expires_at<=clock_timestamp() THEN
    INSERT INTO public.council_admin_events(municipality_id,action) VALUES(p_municipality,'activation-expired');
    RETURN jsonb_build_object('error','Activation link has expired; ask the Platform operator to reissue it','status',410); END IF;
  SELECT * INTO b FROM public.operating_context_bindings WHERE id=p_binding AND municipality_id=p_municipality FOR SHARE;
  IF NOT FOUND OR b.revoked_at IS NOT NULL OR b.effective_from>clock_timestamp() OR b.effective_to<=clock_timestamp()
    OR EXISTS(SELECT 1 FROM public.platform_municipalities WHERE id=p_municipality AND status='Suspended')
    OR (p_route IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.service_routes WHERE id=p_route AND service='commandmaps'
      AND municipality_id=p_municipality AND binding_id=p_binding AND state='ready')) THEN
    INSERT INTO public.council_admin_events(municipality_id,action) VALUES(p_municipality,'activation-context-rejected');
    RETURN jsonb_build_object('error','Activation context is unavailable','status',403); END IF;
  IF EXISTS(SELECT 1 FROM public.users WHERE email=lower(a.email)) THEN
    INSERT INTO public.council_admin_events(municipality_id,action) VALUES(p_municipality,'activation-identity-conflict');
    RETURN jsonb_build_object('error','Administrator identity needs operator assistance','status',409); END IF;
  IF p_password_hash !~ '^[a-f0-9]{32}:[a-f0-9]{128}$' THEN RAISE EXCEPTION 'Invalid credential hash'; END IF;
  new_user=gen_random_uuid();
  INSERT INTO public.users(id,email,name,password_hash,role,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,team_id)
    VALUES(new_user,lower(a.email),a.first_name || ' ' || a.last_name,p_password_hash,'ADMIN',b.tenant_id,b.jurisdiction_id,
      b.data_plane_id,b.organisation_id,b.branch_id,'council-administration');
  INSERT INTO public.operating_context_grants(user_id,binding_id,effective_from) VALUES(new_user,p_binding,clock_timestamp());
  UPDATE public.platform_first_admins SET activation_state='Activated',user_id=new_user,binding_id=p_binding WHERE municipality_id=p_municipality;
  UPDATE public.platform_municipalities SET status='Active',version=version+1 WHERE id=p_municipality;
  UPDATE public.council_admin_activations SET redeemed_at=clock_timestamp() WHERE id=t.id;
  UPDATE public.council_admin_activations SET revoked_at=clock_timestamp() WHERE municipality_id=p_municipality
    AND id<>t.id AND redeemed_at IS NULL AND revoked_at IS NULL;
  INSERT INTO public.council_admin_events(municipality_id,user_id,action) VALUES(p_municipality,new_user,'activation-redeemed');
  RETURN jsonb_build_object('ok',true,'email',lower(a.email),'bindingId',p_binding);
END $$;
CREATE FUNCTION civicmaps_disable_admin(p_municipality uuid,p_operator uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE a public.platform_first_admins;
BEGIN
  SELECT * INTO a FROM public.platform_first_admins WHERE municipality_id=p_municipality FOR UPDATE;
  IF NOT FOUND OR NOT EXISTS(SELECT 1 FROM public.platform_operators WHERE id=p_operator AND active)
    THEN RAISE EXCEPTION 'Administrator unavailable' USING ERRCODE='22023'; END IF;
  IF a.user_id IS NOT NULL THEN
    UPDATE public.users SET active=false WHERE id=a.user_id AND role='ADMIN';
    DELETE FROM public.sessions WHERE user_id=a.user_id;
  END IF;
  UPDATE public.council_admin_activations SET revoked_at=clock_timestamp()
    WHERE municipality_id=p_municipality AND redeemed_at IS NULL AND revoked_at IS NULL;
  UPDATE public.platform_first_admins SET activation_state='Disabled' WHERE municipality_id=p_municipality;
  INSERT INTO public.council_admin_events(municipality_id,operator_id,user_id,action)
    VALUES(p_municipality,p_operator,a.user_id,'administrator-disabled');
  RETURN jsonb_build_object('ok',true);
END $$;
CREATE FUNCTION civicmaps_lock_login_user(p_user uuid) RETURNS void LANGUAGE plpgsql
SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
  PERFORM 1 FROM public.users WHERE id=p_user FOR SHARE;
END $$;
CREATE FUNCTION civicmaps_operational_actor() RETURNS boolean LANGUAGE sql STABLE
SECURITY DEFINER SET search_path=pg_catalog,public AS $$
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id::text=current_setting('civicmaps.actor',true) AND role<>'ADMIN' AND active);
$$;
REVOKE ALL ON FUNCTION civicmaps_admin_status(uuid),civicmaps_issue_admin(uuid,uuid,uuid,text,uuid,text),
  civicmaps_redeem_admin(uuid,uuid,text,text,uuid),civicmaps_disable_admin(uuid,uuid),civicmaps_lock_login_user(uuid),civicmaps_operational_actor() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION civicmaps_admin_status(uuid),civicmaps_issue_admin(uuid,uuid,uuid,text,uuid,text),civicmaps_disable_admin(uuid,uuid) TO civicmaps_platform_app;
GRANT EXECUTE ON FUNCTION civicmaps_operational_actor() TO civicmaps_local_app;
CREATE POLICY non_admin_requests ON service_requests AS RESTRICTIVE TO civicmaps_local_app USING(public.civicmaps_operational_actor());
CREATE POLICY non_admin_audit ON audit_events AS RESTRICTIVE TO civicmaps_local_app USING(public.civicmaps_operational_actor());
CREATE POLICY non_admin_personnel ON users AS RESTRICTIVE TO civicmaps_local_app USING(public.civicmaps_operational_actor());
CREATE POLICY non_admin_receipts ON mutation_receipts AS RESTRICTIVE TO civicmaps_local_app USING(public.civicmaps_operational_actor());
-- Existing deployment broker only; app roles receive no redemption/identity-lock capability.
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='civicmaps_f06_runtime') THEN
    GRANT EXECUTE ON FUNCTION civicmaps_redeem_admin(uuid,uuid,text,text,uuid),civicmaps_lock_login_user(uuid) TO civicmaps_f06_runtime;
  END IF;
END $$;
