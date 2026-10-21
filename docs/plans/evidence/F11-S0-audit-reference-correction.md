# F11 S0 audit reference correction — 21 October 2026

The historical S0 assessment at [F11-S0-independent-audit-6a590e4.md](F11-S0-independent-audit-6a590e4.md) reports a pass for tree `6a590e4321b37eb609fbb17b22cdcca36b1b9380`. On the fetched feature branch, that tree is absent from the Git object database (`git cat-file -t` fails), and its audited snapshot is not an ancestor of the published branch commit. The retained audit report gives hashes for its baseline evidence and README, but not a complete reconstruction recipe for the checkpoint. Consequently the report cannot establish that the current committed checkpoint was the exact assessed product.

The report remains useful as a historical, narrowly scoped S0 review. Its findings and stated limits are preserved. The checkpoint now marks the pass as historical and unbound to a reachable candidate. Do not use it as acceptance of the current branch. The next action is a fresh assessment of a committed candidate whose tree and evidence are reachable and verified.

This correction changes no application code and makes no F11 functional acceptance claim.
