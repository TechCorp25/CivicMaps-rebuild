# Final targeted P1 reassessment

Verdict: **pass — corrected partial-readiness checkpoint accepted; feature implementation remains blocked.**

Exact inspected candidate: `e12607b43e6ade9586d4e4facfdd32d5f6a18e15`
Base: `d34cf9fd692fabc24d17ff1a9657be9b724d620f`
Date: 27 October 2026

This targeted assessment checks corrections to the earlier pricing and key-authority findings. It accepts the checkpoint as an accurate record of partial P1 readiness, not P1 exit completion, provider approval, implementation acceptance or release authorisation. Earlier reports remain retained.

## Findings resolved

- The selected preview-compatible legacy flow now uses per-request autocomplete and Geocoder place-ID/reverse resolution for the estimate. Places New session discounts and Place Details Essentials pricing are explicitly excluded.
- Forward and reverse requests aggregate to one Geocoding SKU: 15,000 illustrative events less the 10,000 allowance costs $25. Total is correctly $70 + $84.90 + $25 = **$179.90 USD/month**. Low-volume illustration and 31-day threshold arithmetic are consistent (6,200 autocomplete; 2,325 combined Geocoding).
- Existing-key reuse through protected runtime configuration is consistently authorised, subject to pending restrictions/cost review. The conflicting blanket prohibition on reuse is removed; prohibitions on placing values in source/evidence remain.
- Browser application thresholds are now correctly described as telemetry alerts rather than enforced project-wide spending caps. A new scoped mediation path would require a separate reviewed design.

Minor terminology improvement, non-blocking: name the legacy autocomplete SKU exactly `Autocomplete - Per Request`; the text's generic `Autocomplete Requests` is disambiguated by its explicit legacy/per-request selection and exclusion of New pricing.

## Checks and boundaries

Verified full local SHA; inspected complete checkpoint diff from `6d6e6f90b304e5a5f966ea22bb3d2213282daecd`; `git diff --check` for the correction passed; checkout clean. Prior official pricing evidence supports the corrected calculation. No application suites, provider calls, secret access, infrastructure changes, merge or deployment performed. Remote publication equivalence and recovered preview source were not independently reverified in this targeted pass; previous evidence limitations remain.

## Next permitted action

Continue read-only reconciliation of accepted quality-remediation receipts and the actual Google project/key restrictions, billing usage, quotas, map-ID ownership, licensing/disclosure and cost acceptance. Record outcomes in the rebuild checkpoint. Feature implementation remains blocked by its stated remediation gate; live provider use remains blocked by outstanding actual configuration/cost review. This pass does not authorise provisioning, spending, operational-data disclosure, merge or deployment.
