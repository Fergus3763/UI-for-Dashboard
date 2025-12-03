# HUB #8 — QUICK START DOCUMENT  
**This document gives a fast, high-level orientation so HUB #8 does NOT need to load 50+ files up front.**

Each HUB must update this document before handover.

---

# 1. PURPOSE

This Quick-Start gives HUB #8:

- A map of all important parts of the system  
- Where they live  
- How they interact  
- What files matter for which tasks  
- Which Spokes exist or may be needed  
- A safer, staged way to request files

It avoids the heavy upfront cost of pasting all project files at HUB startup.

---

# 2. HIGH-LEVEL SYSTEM MAP

## 2.1 Admin UI (React)

Key directories:
- `admin-ui/src/App.jsx` → routing
- `admin-ui/src/pages/Dashboard/Rooms/` → Room Setup system
- `admin-ui/src/pages/Dashboard/RoomOverview/` → Read-only overview
- `admin-ui/src/pages/Dashboard/VenueSetup/` → Venue & Booking Policy
- `admin-ui/public/` → static HTML pages (booker-view, stubs, etc.)

Core concept:
The Admin UI reads/writes one Supabase record:
table: admin_ui_config
row id: "default"
column: data (JSONB)

---

# 3. NETLIFY FUNCTIONS (BACKEND)

These are required for all persistence:

- `load_config.mjs`  
  Returns `{ ok, id, data }`.

- `save_config.mjs`  
  Merges incoming keys into `data`.

- `blackout_periods.mjs`  
  GET/POST blackout persistence.

- `availability.mjs`  
  Computes and returns blackout-based availability.

These are the ONLY legal persistence methods.

---

# 4. DATA MODEL TOUCHPOINTS

## 4.1 Rooms (admin_ui_config.data.rooms[])
Each room includes:

- id  
- code (unique, RM-001 style)  
- name  
- description  
- active  
- images (max 6 URLs)  
- features  
- layouts (with capacities)  
- pricing (per-person, per-room, rule = HIGHER/LOWER)  
- buffers (before/after)  
- includedAddOnIds  
- optionalAddOnIds  

**Room Overview** is read-only and depends entirely on whatever Room Setup saves.

**Room Setup** writes the canonical rooms[] array to `save_config`.

---

## 4.2 Add-Ons (admin_ui_config.data.addOns[])
Add-Ons are created in the Add-Ons tab and define:

- id
- name
- category
- included / optional flags per room (via Rooms)

Touchpoints:

- Room Setup reads addOns[] to assign includedAddOnIds / optionalAddOnIds.
- Room Overview reads addOns[] to display human names.
- Booker View reads addOns[] for upsell display.

---

# 5. KEY FILES BY FUNCTION

You will request these ONLY when needed.

### Routing:
- `admin-ui/src/App.jsx`

### Rooms (core editable system):
- `admin-ui/src/pages/Dashboard/Rooms/index.jsx`
- `admin-ui/src/pages/Dashboard/Rooms/RoomSetupTab.jsx`
- `RoomListPanel.jsx`
- `RoomForm.jsx`
- `RoomImagesEditor.jsx`
- `RoomLayoutsEditor.jsx`
- `RoomPricingEditor.jsx`
- `RoomBuffersAndAddOns.jsx`

### Room Overview:
- `admin-ui/src/pages/Dashboard/RoomOverview/index.jsx`

### Venue Setup:
- `VenueSetup/index.jsx`
- `Tabs/*.jsx`

### Functions:
- `load_config.mjs`
- `save_config.mjs`
- `blackout_periods.mjs`
- `availability.mjs`

### Static Booker UI:
- `public/booker-view.html`

---

# 6. WHAT HUB #8 MUST DO WHEN STARTING WORK

Follow this rule:

> **HUB must not begin work on any file until the OWNER pastes that file in full.**

Instead follow this process:

1. OWNER states objective.  
2. HUB consults Quick-Start map.  
3. HUB requests only the files related to that objective.  
4. HUB analyses, then either:  
   - writes a Spoke prompt, or  
   - specifies patches/rewrites  
5. OWNER pastes resulting files into GitHub.  
6. HUB verifies deployment, updates handover docs.

---

# 7. SPOKE MANAGEMENT MODEL

Spokes are used for *focused implementation tasks* such as:

- Room Setup rebuild  
- Add-On DB rebuild  
- Room Overview improvements  
- Booker pricing logic  
- Availability extensions  

Each Spoke receives:

- Narrow scope  
- Full acceptance criteria  
- Explicit constraints  
- Clear file paths to modify  
- Complete file replacements (never partials unless explicitly allowed)

HUB #8 reviews all work before approving deployment.

---

# 8. HANDOVER REQUIREMENT

Every HUB must update this **Quick-Start Document** before ending its session.

Specifically:

- Add changes in architecture  
- Add new touchpoints  
- Add new files  
- Update task sequencing  
- Add warnings or known issues  

This ensures continuity from HUB → HUB.

---

End of HUB8_QUICK_START.md
