/handover/NEXT_ACTIONS_HUB7.md
Canonical — Updated for HUB #6 → HUB #7 Handover
1. Boot Sequence (MANDATORY)

A new HUB #7 session must not begin any development until:

The OWNER has pasted all files listed in /handover/HUB7_REQUIRED_FILES.md, each as separate messages.

The HUB has confirmed the real paths for:

admin-ui/src/pages/Dashboard/Rooms/index.jsx

admin-ui/src/pages/Dashboard/Rooms/RoomSetupTab.jsx

admin-ui/netlify/functions/load_config.mjs

admin-ui/netlify/functions/save_config.mjs

The HUB has confirmed:

Admin UI loads correctly on Netlify

Supabase credentials are valid

Blackout table exists (blackout_periods)

No work may start until the HUB confirms all of the above.

2. Immediate Tasks (FIRST ACTIONS)

HUB #7 MUST begin with this sequence. No other work may begin until these tasks are complete.

2.1 Implement Blackout & Availability Persistence (Netlify Functions)

Create in this repo:

netlify/functions/blackout_periods.mjs

netlify/functions/availability.mjs

Both must:

Use Supabase server-side keys

Read and write the blackout_periods table

Validate room_id

Support:

GET → list blackouts

POST → insert blackout

Return stable JSON

Enforce valid time ranges

2.2 Wire Admin UI → API for Blackouts

In RoomSetupTab.jsx:

Load blackouts via GET blackout_periods?roomId=...

Save blackout via POST blackout_periods

Refresh list after save

Persist after reload

Show errors clearly

Blackouts must survive refresh and load reliably.

2.3 Add Room Code Auto-Generation

When creating a room:

Auto-generate codes: R-001, R-002, ...

Ensure uniqueness in data.rooms[]

Prevent saving empty/invalid codes

2.4 Validate Full Persistence Round-Trip

HUB #7 must confirm:

UI loads correctly via load_config

UI saves correctly via save_config

Supabase persists the modified data

Reload reproduces the same data

No destructive overwrites occur

3. Sequencing (MANDATORY ORDER)

Build blackout functions

Build availability function

Connect UI blackout form to API

Add room-code auto generator

Validate full round-trip persistence

Prepare Booker-side availability stub

Update documentation

4. Behaviour Rules for HUB #7
4.1 Explanations

Default: short, direct, structured.
No long explanations unless OWNER explicitly asks.

4.2 Options

When offering options, HUB must also state:

“My recommendation is Option X because…”

4.3 Trigger Word

If OWNER writes:

AUTHORISE

HUB #7 must immediately produce the requested output without extra questions,
unless skipping a question would cause architectural risk.

4.4 Code Output

Always provide full file content, not fragments (except .md patches).

HUB must always confirm:

File path

Replace or modify

Expected behaviour
Before generating code.

5. Guardrails

No local fixes

No touching save_config or load_config without OWNER approval

No database schema changes

availability-spoke repo is historical; do not reuse

Admin UI → API → Supabase is the only valid pipeline

Do not bypass Netlify Functions

Do not overwrite unrelated config keys

6. Completion Criteria

HUB #7 ends its session when:

Blackout persistence is implemented

Availability function implemented

Room code auto-generation implemented

UI → API → DB → UI round-trip validated

Booker availability stub prepared

HUB_CONTEXT.md updated with HUB #7 note

STATUS_SUMMARY.md updated

All changes committed with correct messages

Or when the OWNER closes the chat
