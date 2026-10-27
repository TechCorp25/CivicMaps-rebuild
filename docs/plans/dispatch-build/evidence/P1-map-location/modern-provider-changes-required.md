# Modern provider checkpoint assessment

Verdict: **changes_required — clarify the scale scenario's billable-event mapping.**

Inspected local candidate: `bfc071b076eb055c9a66dd147c741c5a93721427`.
Parent reports remote `f6e0f715d0887e56d3cf26ddc8f40c339afde083`; remote/local equivalence not independently checked. Earlier pass applies only to the earlier historical product.

## Finding

The council-scale paragraph specifies 40,000 autocomplete requests and '10,000 additional forward lookups', but the immediately preceding selected Google scenario has 4,000 completed sessions/Place Details requests. The scale table's Google totals instead require **10,000 Place Details Essentials requests**, not 10,000 additional Geocoding requests on top of that earlier scenario. State explicitly that scale comparison is a separate workload: for example, 10,000 completed four-autocomplete-request sessions, 10,000 Essentials details requests, 5,000 reverse Geocoding requests and 20,000 map loads per council. Map those resolution operations to Geoapify's forward requests for the comparison. Do not label them additional to the preceding 4,000-session scenario. This clarification makes the cost assumptions reproducible and prevents accidental underbudgeting. Also state that daily Geoapify figures are monthly totals divided by 30, and that daily peaks/request-rate limits need separate sizing.

## Verified results

- Places API New is explicitly selected from outset; preview legacy code is reference only. Proposed AutocompleteSuggestion → Place.fetchFields flow, fields id/formattedAddress/location, fresh session tokens and Essentials billing assumptions align internally.
- The standalone 4,000-session Google scenario correctly totals $154.90. Session requests 13+ are not charged under qualifying Essentials termination, and abandoned sessions remain request-billed.
- Scale values are arithmetically correct **for the clarified 10,000-details workload** using shared SKU allowances and tiered rates: one council $154.90; ten $2,775.70 (Maps $1,190 + autocomplete $935.70 + details $450 + reverse $200); fifty $10,932.70 (Maps $4,970 + autocomplete $2,862.70 + details $2,050 + reverse $1,050).
- Geoapify estimate per council is 20,000 × 50 × 0.25 + 40,000 + 10,000 + 5,000 = 305,000 monthly credits. Dividing by 30 gives about 10,167/day, scaling to 101,667 and 508,333. Official pricing excerpts confirm API25 $109/month for 25,000/day, API250 $609/month for 250,000/day, custom from $860 with quote required. Official API documentation supports 0.25/tile and one credit per autocomplete/forward/reverse request. Synthetic tile-demand validation is appropriately required.
- G-NAF is presented as a data alternative with infrastructure/ingestion/operations costs, not a free equivalent hosted service. Licensing restrictions and address-quality validation remain prerequisites.
- Key reuse authorisation, restriction verification, unknown actual billing configuration, quality gate and partial readiness are represented honestly. No spend, provider calls, customer disclosure or release acceptance claimed.

## Checks and limitations

Read full checkpoint at exact SHA; correction diff whitespace check passed. Official Geoapify evidence retrieved through web search ID `search_d161e115e43078a65f9e5647d1e2b89f`: https://www.geoapify.com/pricing/, https://apidocs.geoapify.com/docs/maps/map-tiles/, https://apidocs.geoapify.com/docs/geocoding/forward-geocoding. Google rates/session evidence retained from prior independent checks. G-NAF licensing text and preview source were not independently re-fetched during this bounded review. No application suites, secret access, product edits or live provider calls.

Next action: clarify the comparison assumptions in documentation, then retain actual project/cost approval and remediation reconciliation as outstanding gates. Acceptance of corrected partial-readiness documentation will not constitute feature implementation readiness or authorise provisioning, spending, merge or deployment.
