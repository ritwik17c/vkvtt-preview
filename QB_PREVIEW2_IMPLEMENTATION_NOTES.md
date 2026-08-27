# VKVTT Preview 2 — Question Bank & Paper Builder

## Scope
This implementation is intentionally confined to the `ritwik17c/vkvtt-preview` repository (`main`) and does not modify the production `ritwik17c/vkvtt` repository.

## Homepage / Teacher Access
- Teacher-only tile: **Question Bank & Paper Builder**
- Injected into `#myAreaGrid` (Section 2 / My Area)
- Requires a linked active teaching-staff code in the existing VKVTT identity model.
- Hidden for non-teaching staff.
- Admin/Principal is routed through the Admin Dashboard instead of the teacher tile.

## Teacher Module (`qb-module.html`)
- Voice input: English, Assamese, Hindi and Sanskrit (browser support dependent)
- Assist / Auto / Manual modes
- Mathematical symbol toolbar
- Draft / Submitted / Returned / Approved workflow
- Subject Coordinator review tab when assigned
- Appealing submission history with workflow trail
- Verified Question Bank filters
- Basic paper builder and paper templates
- Excel import template
- Excel import as draft
- Teacher-wise export
- Guidance link

## Principal/Admin Module (`admin-question-bank.html`)
- Metrics: submitted, verified, pending, returned, contributors, coordinator assignments
- Full workflow trail: teacher → coordinator → submission/verification dates
- Filters by teacher, class, subject, status and date
- Verified-question leaderboard
- Click-through trace from leaderboard to workflow
- Subject Coordinator assignment
- Awards & Recognition record
- Full/filtered Excel exports
- Module enable/disable setting
- Import template download

## Data
Planned Firestore collections:
- `qbConfig`
- `qbQuestions`
- `qbTemplates`
- `qbPapers`
- `qbAwards`

## Security
`FIRESTORE_RULES_QB_PREVIEW2_PATCH.txt` contains a restrictive patch. It deliberately avoids a broad allow rule and keeps teacher ownership and coordinator decisions subject-scoped.

**The rule patch must be merged into the active Firestore rules and published before cloud QB writes can work.** Merely committing the rule text to GitHub does not publish Firebase rules.

## Leaderboard Rule
Only records with `status == approved` count as verified questions. Draft, pending and returned records do not count.

## Governance
Teacher → Subject Coordinator → Verified Question Bank → Leaderboard → Principal Awards.
