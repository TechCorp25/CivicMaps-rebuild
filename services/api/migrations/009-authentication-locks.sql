-- The control broker needs row locks, without UPDATE authority over identities or grants.
-- These void helpers expose no new rows and perform no data mutations.
CREATE FUNCTION civicmaps_lock_user_contexts(p_user uuid) RETURNS void LANGUAGE plpgsql
SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
  PERFORM 1 FROM public.operating_context_grants g
    JOIN public.operating_context_bindings b ON b.id=g.binding_id
    WHERE g.user_id=p_user ORDER BY b.id FOR SHARE OF b,g;
END $$;
CREATE FUNCTION civicmaps_lock_auth_session(p_hash text,p_platform boolean,p_exclusive boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
  IF p_platform THEN
    IF p_exclusive THEN
      PERFORM 1 FROM public.platform_sessions WHERE token_hash=p_hash AND expires_at>now() FOR UPDATE;
    ELSE
      PERFORM 1 FROM public.platform_sessions s JOIN public.platform_operators o ON o.id=s.operator_id
        WHERE s.token_hash=p_hash AND s.expires_at>now() AND o.active FOR SHARE OF o,s;
    END IF;
  ELSE
    IF p_exclusive THEN
      PERFORM 1 FROM public.sessions WHERE token_hash=p_hash AND expires_at>now() FOR UPDATE;
    ELSE
      PERFORM 1 FROM public.sessions s JOIN public.users u ON u.id=s.user_id
        WHERE s.token_hash=p_hash AND s.expires_at>now() AND u.active FOR SHARE OF u,s;
    END IF;
  END IF;
END $$;
REVOKE ALL ON FUNCTION civicmaps_lock_user_contexts(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION civicmaps_lock_auth_session(text,boolean,boolean) FROM PUBLIC;
-- Deployment grants execution only to its trusted broker. Council/platform app roles get none.
