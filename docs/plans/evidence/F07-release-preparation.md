# F07 release preparation — live gate pending

Prepared 18 October 2026 by Codex (agent). **Historical preparation checkpoint:** the inputs below were subsequently supplied and F07 deployed/live accepted. Use [release closure](F07-release-closure.md) for current state; the original preparation facts below are retained as history.

- Selected merged source: `2b73318a57c97baecb52711beca401ed3a162339`, owner-merged PR #19. [Merged-source CI](https://github.com/TechCorp25/CivicMaps-rebuild/actions/runs/39070898955) passed. Source was staged in a clean detached worktree, independently of PR #20's planning edits.
- Clean Node24.19.0/npm11.9.0 setup/build succeeded with a workspace-local npm cache. `npm run check` passed lint, formatting, both typechecks/builds and **69/69 integration checks** against the existing dedicated local PostgreSQL17 instance, using uniquely owned disposable test databases. Initial verification lacked PostgreSQL tools in PATH; configuring the existing tool directory resolved both backup-test failures, then the complete check passed. No source change was required.
- Local archive SHA256: `e8ef4c6f63c4e7a46e5d0202983093f05c0a8517783b9c9d96dc797584b69df1`; size `12647361` bytes. Includes clean source, built web outputs and the exact deployed-revision marker. Private object upload/version remains pending.
- Reviewed migration012's conditional grants to the existing runtime broker and restrictive ADMIN policies. Upgrade/bootstrap preservation, token/reissue/concurrency and disable-versus-login checks pass locally. Future live checks must verify those privileges on the actual runtime.
- Existing release helper is suitable for further qualification before activation; after any F07 identity exists, old-code compatibility is not assumed. Keep migration012, audit and populated data; recovery must use verified compatible F07 code or a corrective forward release as described in the plan.

## Required execution inputs

AWS CLI reported the saved CivicMAPS session expired. A fresh remote login is awaiting the owner's authorisation code. No current runtime, plan/spend or resource-state observation is claimed from that failed login.

The owner must identify the synthetic administrator/recipient/context that should remain usable, a separate designation reserved for permanent disable, and the verified operator/delivery channel before links are issued or administrator state is changed. Those choices are pending; no live token was issued or identity changed.

No AWS resource, configuration, database or deployment change has been performed during this preparation. Last saved verified runtime source is F06Q `3dfb031`; it must be re-observed after login. Continue with the [execution plan](../F08-next-phase-plan.md). D03 and F08 implementation remain gated on the F07 live-release result.
