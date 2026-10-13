ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_scope ON users TO civicmaps_local_app USING (
  tenant_id = current_setting('civicmaps.tenant', true)
  AND jurisdiction_id = current_setting('civicmaps.jurisdiction', true)
  AND data_plane_id = current_setting('civicmaps.plane', true)
  AND organisation_id = current_setting('civicmaps.organisation', true)
  AND branch_id = current_setting('civicmaps.branch', true)
);
ALTER TABLE mutation_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY receipt_actor ON mutation_receipts TO civicmaps_local_app USING (actor_id::text = current_setting('civicmaps.actor', true));
