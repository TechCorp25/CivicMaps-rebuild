-- Upgrade already deployed F06 without rewriting immutable municipality identities or hosts.
ALTER TABLE service_routes ADD COLUMN municipality_token text;
UPDATE service_routes r SET municipality_token = CASE
  WHEN m.id='20000000-0000-4000-8000-000000000001' AND m.slug='synthetic-alpha' THEN 'alpha'
  WHEN m.id='20000000-0000-4000-8000-000000000002' AND m.slug='synthetic-beta' THEN 'beta'
  WHEN length(m.slug)<=47 AND m.slug NOT LIKE 'id-%' AND m.slug NOT IN ('alpha','beta') THEN m.slug
  ELSE 'id-' || replace(m.id::text,'-','') END
FROM platform_municipalities m WHERE m.id=r.municipality_id;
-- An incompatible existing route requires explicit withdrawal/reconciliation, never silent rebinding.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM service_routes WHERE service='commandmaps'
    AND hostname<>municipality_token || '-commandmaps.dev.civicmaps.com.au') THEN
    RAISE EXCEPTION 'Route naming conflict: reconcile recorded ownership before migration';
  END IF;
END $$;
ALTER TABLE service_routes ADD CONSTRAINT service_route_dns_label_length
  CHECK (length(split_part(hostname,'.',1))<=63);
ALTER TABLE service_routes ADD CONSTRAINT service_route_municipality_token
  CHECK ((service='platform' AND municipality_token IS NULL)
    OR (service='commandmaps' AND municipality_token IS NOT NULL
      AND length(municipality_token)<=47
      AND municipality_token ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      AND hostname=municipality_token || '-commandmaps.dev.civicmaps.com.au'));
