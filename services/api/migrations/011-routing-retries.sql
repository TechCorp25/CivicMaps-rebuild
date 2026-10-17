-- Durable retry deadlines survive worker restarts; withdrawn/terminal routes are never selected.
ALTER TABLE service_routes ADD COLUMN next_attempt_at timestamptz;
GRANT UPDATE (next_attempt_at) ON service_routes TO civicmaps_platform_app;
