# Runs as OS postgres after migrations. No SQL/password is written to command arguments or stdout.
import subprocess,secrets,os
from pathlib import Path
out=Path('/var/lib/pgsql/f06-runtime-url')
password=out.read_text().split(':')[2].split('@')[0] if out.exists() else secrets.token_hex(32)
sql="""DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='civicmaps_f06_runtime') THEN CREATE ROLE civicmaps_f06_runtime LOGIN; END IF; END $$;
ALTER ROLE civicmaps_f06_runtime NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION BYPASSRLS PASSWORD '%s';
GRANT CONNECT ON DATABASE civicmaps_f06 TO civicmaps_f06_runtime;
GRANT USAGE ON SCHEMA public TO civicmaps_f06_runtime;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO civicmaps_f06_runtime;
GRANT INSERT,DELETE ON sessions,platform_sessions TO civicmaps_f06_runtime;
GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO civicmaps_f06_runtime;
GRANT civicmaps_local_app,civicmaps_platform_app TO civicmaps_f06_runtime;
GRANT EXECUTE ON FUNCTION civicmaps_redeem_admin(uuid,uuid,text,text,uuid),civicmaps_lock_login_user(uuid) TO civicmaps_f06_runtime;
GRANT EXECUTE ON FUNCTION civicmaps_lock_user_contexts(uuid),civicmaps_lock_auth_session(text,boolean,boolean) TO civicmaps_f06_runtime;
""" % password
subprocess.run(['psql','-v','ON_ERROR_STOP=1','-d','civicmaps_f06'],input=sql,text=True,check=True,stdout=subprocess.DEVNULL)
# Root-owned env is updated by the root bootstrap after this helper returns.
out=Path('/var/lib/pgsql/f06-runtime-url')
fd=os.open(out,os.O_CREAT|os.O_TRUNC|os.O_WRONLY,0o600)
with os.fdopen(fd,'w') as f:f.write('postgresql://civicmaps_f06_runtime:'+password+'@127.0.0.1:5432/civicmaps_f06')
