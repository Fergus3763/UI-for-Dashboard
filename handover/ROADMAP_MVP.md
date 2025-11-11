# Meeting Rooms — MVP Roadmap (Hub #3)
> **Canonical roadmap note (HUB #5):**
> This file is the authoritative roadmap. Any similarly named file elsewhere
> (e.g. under `/admin-ui/`) is a pointer only.

> ⚠️ **Note:** Any existing or historical references to “WorXinn” should be disregarded. All context, ownership, and intent refer solely to the **OWNER**. No material or background research is to be drawn from the OWNER’s prior GPT chats or any online sources.

> Edit directly in GitHub. Mermaid renders automatically.  
> How to update:
> - Move tasks between phases by copy/paste.
> - Mark progress by changing node class to `done`, `wip`, or `todo`.
> - Update the checklists below with `[x]` when something ships.

---

## Visual Countdown (Now → Presentation)

flowchart LR
  %% Styles
  classDef done fill:#d1fae5,stroke:#10b981,stroke-width:2px,color:#065f46;      %% green
  classDef wip fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#1e3a8a;       %% indigo
  classDef todo fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#7c2d12;      %% amber
  classDef gate fill:#f3f4f6,stroke:#111827,stroke-width:2px,color:#111827;      %% neutral
  classDef big fill:#ffffff,stroke:#111827,stroke-width:2.5px;

  %% PHASE GATES (use quoted rectangular nodes to allow parentheses/long text)
  G0["HUB #3 Start"]:::gate
  G1["Phase 3 ✓ Function Smoke Test"]:::gate
  G2["Phase 4 Save → API — persist data"]:::gate
  G3["Phase 5 Data Models & Validation"]:::gate
  G4["Phase 6 Booker MVP — Hotel-facing"]:::gate
  G5["Phase 7 QA & Stability"]:::gate
  G6["Phase 8 UI/UX Polish"]:::gate
  G7["Phase 9 Tag v0.3.2 + Handover"]:::gate

  %% LANE: Admin Config
  subgraph A[Admin Configuration]
    A1[Venue Setup]:::done
    A2[Rooms Setup]:::done
    A3[F&B Setup]:::done
    A4[AV Setup]:::done
    A5[Labour Setup]:::done
    A6[3rd-Party Setup]:::done
    A7[VAT Classes]:::wip
    A8[Add-Ons & Upsells]:::wip
  end

  %% LANE: API/Persistence
  subgraph B[Data/API]
    B1[Create Netlify Functions: save_config]:::todo
    B2[Wire front-end Save → Function]:::todo
    B3[Supabase tables & policies MVP]:::todo
    B4[Validation in Function: shape & required]:::todo
    B5[Read/Load config into Admin forms]:::todo
  end
---

### HUB #5 Roadmap Additions (2025-11-11)

**Hotel Dashboard – Near Term**
- Add new **Booking Policy / Terms & Conditions** tab.  
  - Includes Terms text area, Reservation Hold Time, and optional Reservation Fee (%).  
  - Must store values within `public.admin_ui_config → data JSONB`.

**Booker MVP – Phase 1**
- Integrate flexible capacity matching:  
  - Only exclude rooms where requested group > maximum capacity.  
  - Allow smaller groups in larger rooms when reasonable.  
  - Sort results by “closest fit” to requested group size.
- Respect Booking Policy settings from Admin configuration:
  - Enforce hold time for unpaid reservations.
  - Display Terms & Conditions link before final confirmation.
  - Apply reservation fee if enabled.

**Later Enhancements (post-demo)**
- Adjustable “capacity tolerance” per venue.  
- Dynamic pricing based on capacity utilisation.  
- Multi-day or multi-room bookings.

  %% LANE: Booker MVP
  subgraph C[Room Booker (MVP)]
    C1[Basic search: date, time, attendees]:::todo
    C2[Availability check → endpoint]:::done
    C3[Room results: filter by layout/capacity]:::todo
    C4[Configurator: layouts & included items]:::todo
    C5[Add-ons suggestions: curated upsells]:::todo
    C6[Price breakdown: cost centre + VAT]:::todo
    C7[Summary + “Reserve” (stub)]:::todo
  end

  %% LANE: QA/Polish/Release
  subgraph D[QA, Polish, Release]
    D1[Smoke test + error states]:::todo
    D2[Copy/labels pass (plain English)]:::todo
    D3[Simple responsive pass]:::todo
    D4[Mini style pass (spacing/typography)]:::todo
    D5[STATUS_SUMMARY.md + HUB2→HUB3 notes]:::wip
    D6[Tag v0.3.2 + release notes]:::todo
  end

  %% FLOWS
  G0 --> A
  A --> G1
  G1 --> B
  B --> G2
  G2 --> C
  C --> G4
  G4 --> D
  D --> G5
  G5 --> G6
  G6 --> G7
