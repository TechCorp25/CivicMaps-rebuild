DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM users u LEFT JOIN council_principal_owners o ON o.user_id=u.id WHERE o.user_id IS NULL)
    THEN RAISE EXCEPTION 'Principal ownership is incomplete'; END IF;
  IF EXISTS(SELECT 1 FROM sessions s JOIN council_principal_owners o ON o.user_id=s.user_id
      WHERE s.municipality_id IS DISTINCT FROM o.municipality_id)
    THEN RAISE EXCEPTION 'Session ownership is inconsistent'; END IF;
  IF EXISTS(SELECT 1 FROM operating_context_grants g JOIN operating_context_bindings b ON b.id=g.binding_id
      JOIN council_principal_owners o ON o.user_id=g.user_id
      WHERE g.revoked_at IS NULL AND o.municipality_id<>b.municipality_id)
    THEN RAISE EXCEPTION 'Unclassified active operating context grant'; END IF;
END $$;
ALTER TABLE sessions ALTER COLUMN municipality_id SET NOT NULL;
ALTER TABLE sessions ADD CONSTRAINT session_owner_fk FOREIGN KEY (user_id,municipality_id)
  REFERENCES council_principal_owners(user_id,municipality_id);
CREATE FUNCTION validate_session_owner() RETURNS trigger LANGUAGE plpgsql
SET search_path=pg_catalog,public AS $$
BEGIN
  IF TG_OP='UPDATE' AND ROW(NEW.user_id,NEW.municipality_id) IS DISTINCT FROM ROW(OLD.user_id,OLD.municipality_id) THEN
    RAISE EXCEPTION 'Session principal ownership is immutable';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM council_principal_owners o WHERE o.user_id=NEW.user_id AND o.municipality_id=NEW.municipality_id)
    THEN RAISE EXCEPTION 'Session does not match council principal owner'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER session_owner_check BEFORE INSERT OR UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION validate_session_owner();
REVOKE ALL ON FUNCTION immutable_principal_owner(),validate_context_grant_owner() FROM PUBLIC;
REVOKE ALL ON FUNCTION validate_session_owner() FROM PUBLIC;
