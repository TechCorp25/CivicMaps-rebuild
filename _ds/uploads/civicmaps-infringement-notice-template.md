# CivicMAPS — Infringement Notice Template (Dev Reference)

Generic, parameterized notice layout for thermal-printed field infringements. Placeholder tokens (`{{ }}`) mark values that are populated per-issuance or per-authority at runtime — none are hardcoded to a specific council.

---

## 1. Linear Barcode (Code 128) — see barcode-qr-generation-reference.md for the full Modulo-103 algorithm

```
Data String = {{notice_number}}          // 9-digit numeric, Subset C
Check Digit = computed per ISO/IEC 15417 Modulo-103
Symbol      = [Start C] + [notice_number] + [Check Digit] + [Stop] + [Quiet Zone]
```

## 2. QR Code (Model 2) — see barcode-qr-generation-reference.md for Reed-Solomon EC detail

```
Payload = "https://{{platform_domain}}/n/{{notice_number}}"
EC Level = Q (~25% recovery) — recommended for exposed/weather-affected field use
```

---

## 3. Notice Layout

```
[ALIGN: CENTER]
[FONT: BOLD, SIZE: LARGE]
{{issuing_authority_name}}
[FONT: NORMAL, SIZE: MEDIUM]
INFRINGEMENT NOTICE
(Infringements Act 2006)

[ALIGN: LEFT]
[BARCODE: CODE128, DATA: "{{notice_number}}", HEIGHT: 12mm, WRAP: NO]
Notice Number: {{notice_number}}
Date of Issue: {{issue_date}}
Time of Issue: {{issue_time}} (24HR)
Officer ID:    {{officer_id}}
---------------------------------------------------------------------
[FONT: BOLD] VEHICLE DETAILS:
[FONT: NORMAL]
Rego No: {{rego_number}}  State: {{rego_state}}  Expiry: {{rego_expiry}}
Make: {{vehicle_make}}  Type: {{vehicle_type}}
---------------------------------------------------------------------
[FONT: BOLD] OFFENCE DETAILS:
[FONT: NORMAL]
Location: {{offence_location}}
Offence Code: {{offence_code}}
Statute: Road Safety Road Rules 2017 — Rule {{rule_number}}
Description: {{offence_description}}
Penalty Amount: {{fee_units}} fee units × current penalty unit value
                (see Monetary Units Act 2004 annual indexation)
---------------------------------------------------------------------
[FONT: BOLD] HOW TO PAY / ACTIONS:
[FONT: NORMAL]
Due Date: {{due_date}} (28 days from issue date per s. 33 Infringements Act 2006)
Web: {{payment_portal_url}}
Phone: {{payment_phone_number}}

[ALIGN: CENTER]
[QRCODE: MODEL2, ERROR: LEVEL_Q, DATA: "https://{{platform_domain}}/n/{{notice_number}}"]
[FONT: SMALL, ITALIC]
Scan with smartphone camera to view photos or pay online securely.
---------------------------------------------------------------------
[FONT: SMALL]
For internal review, driver nomination, or election to the Magistrates'
Court, visit {{payment_portal_url}} or see reverse of notice.
---------------------------------------------------------------------
[FEED: 40mm]
[CUT]
```

---

## 4. Worked field example

Using an actual Schedule 6 code from your dataset, for reference only:

| Field | Example value |
|---|---|
| offence_code | `720` |
| offence_description | `Stopped in a loading zone` |
| rule_number | `(map from your offence-code → rule-number crosswalk)` |
| fee_units | `(per offence-code fee-unit schedule, not fabricated here)` |

---

## Notes

- `Infringements Act 2006`, `Road Safety Road Rules 2017`, and `Monetary Units Act 2004` are the actual Victorian statute titles — required content under the Act, not branding tied to any specific council.
- `{{issuing_authority_name}}`, `{{platform_domain}}`, `{{payment_portal_url}}` are populated at deploy/issuance time from your own CivicMAPS tenant config — nothing here resolves to a real council identity or a real government domain.
- Penalty amount is deliberately left as a formula, not a number — pull the actual fee-unit-to-dollar figure from the current indexed penalty unit value before this goes anywhere near production.
