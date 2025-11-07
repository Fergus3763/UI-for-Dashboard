📘 HUB2_to_HUB3_Master_Handover.md

Project: – Meeting Room Management SaaS
From: HUB#2 (UI & DB Integration Phase)
To: HUB#3 (Availability, API & System Integration Phase)
Timestamp: 2025-10-30 14:05 (Dublin Time)
Prepared under the direction of: Fergus [Surname], Project Owner (Fergus)

🧭 Executive Summary

This document formally transfers responsibility from HUB#2 to HUB#3 within the Hub-and-Spoke project framework.

The project’s goal is to deliver a SaaS meeting room management platform for hotels and venues — designed to automate the Search → Customise → Pay → Arrive journey for small-team, post-Covid on-demand meetings.

The platform will empower hotels to capture new market demand without additional staff overheads by automating price calculation, availability, and booking confirmation in real time.

HUB#3 now assumes control of all ongoing development, coordination, and direction of current and future Spokes.
### Governance Rule
No local patches or out-of-band changes. All work must land via PR, align with `API_CONTRACT.md` and `DATA_BOUNDARY.md`, and be logged in `RELEASE_NOTES.md`. See `HUB_PROMPT.md` → “Zero Local Patches” for details.

### Quick Links (Authoritative Docs)
- [HUB_PROMPT.md](./HUB_PROMPT.md)
- [API_CONTRACT.md](./API_CONTRACT.md)
- [DATA_BOUNDARY.md](./DATA_BOUNDARY.md)
- [INTEGRATION_PLAN.md](./INTEGRATION_PLAN.md)
- [Supabase handoff notes](./supabase/HANDOFF_TO_API.md)

🏗️ The Big Picture

Owner’s core ambition is to create a comprehensive meeting room booking SaaS for hotels and multipurpose venues.

Market Context

Traditional meeting room bookings were manually processed via phone or email, suited to large, planned events.

The post-Covid landscape favours on-demand, small-group meetings (1–20 people) requiring frictionless engagement, instant pricing, and automated confirmation.

Hotels cannot realistically operate two separate PMS systems, so the solution must accommodate all room sizes, layouts, and use cases, from quick meetings to multi-day conferences.

Product Objectives

Provide real-time pricing accuracy through granular, data-driven configuration.

Enable instant booking confirmation once pricing and availability align.

Allow hotel admins to define every factor influencing pricing:

Time-based (hour, half-day, day)

Attendance (per person)

Layout, inclusions, upsells, and add-ons

Availability, blackout periods, VAT, and cost structures

Build a hotel-facing dashboard first (admin input → pricing logic → DB seed).

Follow with a Booker UI MVP that demonstrates how those admin inputs dynamically affect real-time customer pricing.

The ultimate aim is trust and transparency — both the hotel and the booker must have confidence that the generated price is accurate and contractual.

⚙️ HUB#2 Scope & Deliverables

HUB#2 focused on structuring the foundational architecture of the MVP.

✅ Completed under HUB#2
Area	Deliverable	Status
Database	Full Supabase schema created (vat, catalog, rooms, durations, room_catalog_map, blackout_periods).	✅
Data Normalisation	Five CSVs (Catalog, Rooms, RoomCatalogMap, VAT, Durations) validated per Data Dictionary.	✅
Validation	SQL validation suite complete; VALIDATION.md committed.	✅
Environment	Netlify environment vars set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).	✅
API Layer (initial)	netlify/functions/blackout_periods.js + availability.js implemented and merged.	✅
Testing	Endpoint validation through Postman and browser JSON test.	✅
Docs	/handover/ folder maintained; live record of data and integrations.	✅
🔧 Remaining or Next Actions for HUB#3
Category	Task	Description / Notes
Availability API	Validate room blackout creation and event persistence.	Ensure blackout_periods are reflected correctly in availability.js.
Booker UI MVP	Connect API results (availability, blackout, pricing) to front-end UI.	This will demonstrate end-to-end flow.
Seed Automation	Optional: Generate seed.js for one-command data load (CI/local).	DB Spoke offered assistance.
Continuous Docs	Maintain /handover/ as the single source of truth.	Update after every major change.
Future Spokes	See below.	—
🧩 Active & Planned Spokes
Spoke	Purpose	Current Status
Database / Calculus Spoke	Structured & normalised all data. Provided five CSVs and logic for price calculation.	✅ Complete
Availability Spoke	Implemented blackout periods & availability endpoints.	🔄 Ongoing (HUB#3 to monitor)
API Spoke (Planned)	Will expand the API beyond blackout/availability to full CRUD for room data and pricing.	⏳ Next phase
Booker UI Spoke (Planned)	Builds the customer-facing MVP showing the Search → Customise → Pay → Arrive flow.	⏳ Next
Automation/CI Spoke (Future)	Automates DB seed, deployment & test validation.	📅 Future
🧱 Architectural Overview

Frontend: React (Capacitor wrapper for mobile).

Backend: Node.js API hosted via Netlify Functions.

Database: Supabase (PostgreSQL + Auth + Storage).

Integrations: Stripe for payment, Firebase for auth (in future MVP scope).

Version Control: GitHub repositories managed under branch naming convention:
feat/{feature-name} → PR → merge → Netlify auto-deploy.

Primary repositories:

UI-for-Dashboard/ (main project root; includes /handover/, /glossary/, /data/).

Availability-Spoke/ (temporary working repo for API/blackout work; should merge into UI-for-Dashboard after review).

🧭 Governance & Workflow Rules

HUB = Keeper of Truth.

Maintains /handover/ and /glossary/ as definitive project documentation.

Approves all merges and initiates new Spokes.

Spokes = Execution Units.

Carry out self-contained tasks (e.g., API, DB, UI).

Report back via structured handovers.

Handover Updates.

/handover/ must be updated routinely after each major merge or feature completion to prevent knowledge loss.

Structured Instructions.

All technical directions must be given in numbered steps (1 → 2 → 3 → …).

Avoid shorthand or truncated instructions.

Fergus’ Oversight.

Fergus reviews each stage but prefers step-based execution instructions without technical exposition unless necessary.

🕰️ Version Control & Documentation
File	Purpose	Location
HUB2_to_HUB3_Master_Handover.md	This document.	/handover/
VALIDATION.md	Database integrity results.	/handover/supabase/
Assumptions_and_Ambiguities_Report.txt	Data normalization notes.	/data/db/
README.md	Live repository summary.	Root directory
Meeting_Rooms_Glossary_and_Dictionary.xlsx	Master glossary & field dictionary.	/glossary/
🔮 Outlook for HUB#3

Continue API development with emphasis on availability logic and integration into the Booker UI.

Validate blackout persistence and real-time price interrogation.

Ensure all additions maintain alignment with the Data Dictionary and Glossary.

Introduce structured logging & test scripts for API endpoints before moving to CI automation.

Update /handover/ immediately following the completion of each spoke or feature merge.

🪪 Signature & Metadata

Prepared under the direction of
Fergus [Surname] — Project Owner, Fergus
Finalized and approved by HUB#2 on 30 October 2025, 14:05 (Dublin Time).

✅ Step-by-Step GitHub Upload Protocol

Goal: Commit this document to /handover/ in the main repository (UI-for-Dashboard).

1️⃣ Go to your GitHub repository: UI-for-Dashboard
2️⃣ Click Add file → Create new file
3️⃣ Path:

handover/HUB2_to_HUB3_Master_Handover.md


4️⃣ Paste the entire Markdown content above.
5️⃣ Commit message:

docs(handover): add HUB#2 → HUB#3 Master Handover (Dublin timestamp)


6️⃣ Select Commit directly to main branch → Click Commit changes.
7️⃣ Confirm the file appears under /handover/.
8️⃣ Optionally, copy the timestamped signature into your internal notes for redundancy.

Status Snapshot (post-HUB#2)
- [x] Env vars aligned (confirmed Netlify + GitHub)
- [x] Schema updated: blackout_periods.title
- [ ] Verify Netlify bundle includes updated endpoints (handover to HUB#4)
