> **Canonical spec note (HUB#4):**
> This file is the **authoritative MVP spec** for the project.
> Any other `SPEC_MASTER*` files (e.g. under `admin-ui/`) are pointers only
> and must not diverge from this document.

> **File Purpose (added HUB#4):**  
> This recovered master spec consolidates all Admin UI and Pricing logic decisions made during HUB#3.  
> Treat as the single authoritative reference for subsequent development and schema integration.

# Meeting Rooms — Single‑Page Master Spec (Single File)

> **Status:** HUB #3 · Design-in-progress · All work tracked in this single page. If it’s not here, it doesn’t exist.

> ⚠️ **Note:** Any existing or historical references to “WorXinn” should be disregarded. All context, ownership, and intent refer solely to the **OWNER**. No material or background research is to be drawn from the OWNER’s prior GPT chats or any online sources.

---

## 🌍 Vision & Context

This project maintains two equal workstreams — the **Technical Spine** and the **Vision Layer** — to ensure every build task serves a clear purpose.

| Track | Purpose | Output | Style |
|-------|----------|--------|--------|
| **A. Context & Vision** | Preserve and update the *business logic, reasoning, and purpose* behind each module. | “Vision Overview” section inside the master spec. | Plain English, readable by non-developers. |
| **B. Technical Execution** | Implement what the Vision requires in working code, schema, and UI. | Code snippets, file edits, commit messages. | Step-by-step, copy-and-paste friendly. |

Each time a new element is created (UI page, function, data table, etc.), it includes:
- A **Vision Paragraph** explaining *why it exists*.
- The **Implementation Block** showing *what to add/edit/delete*.

This dual-track model, introduced in HUB #3, keeps future HUBs balanced between purpose and execution.

---

### Spec Delta Log (HUB #3)

* **[Locked:** Pending DB/Code Check **]** Added: Add-Ons vs Features definitions; Pricing Models; Inclusive + Inclusive Threshold; Upsell Eligible; Add-Ons & Upsells tab consolidated; Venue Images at setup.
* All items marked **(Pending DB/Code Check)** will be confirmed/adjusted after Supabase schema & code grep.

---

## 🧭 Vision Layer — Context & Purpose

### Background

The **meeting-room hire market** changed after Covid. Large conferences declined, replaced by smaller, on-demand team meetings (2–20 people). These groups expect **instant availability, transparent pricing, and one-click booking**. Hotels, however, still manage meeting rooms manually through human-to-human negotiation, which is labour-intensive and costly.

### Problem

Manual handling works for high-value, long-lead events but is **too expensive for low-value, high-frequency small bookings**. Hotels need automation but cannot maintain **two systems**—one for large events and one for smaller meetings. They need **one unified platform** that delivers automation for smaller bookings while preserving accuracy for larger ones.

### Vision

We solves this by providing a **fully automated SaaS platform** that lets hotels sell meeting rooms like spa treatments—instant pricing, instant confirmation, no human bottleneck. The platform’s credibility depends on **price integrity**: the price seen by the Booker must match the one calculated by the Hotel’s backend.

### MVP Objective

To demonstrate to hotel operators that:

1. **The system produces accurate, reliable prices** for any room configuration.
2. **Initial setup (data entry) is detailed but one-time** and guarantees long-term automation.
3. **Labour savings** outweigh setup effort through faster conversions and reduced manual processing.
4. The **Booker UI** reflects exactly what the backend calculates, reinforcing hotel trust.

---

## 🔧 Implementation Template (for all technical instructions)

Each future task will include these sections:

### **1. Purpose (Plain English)**

> Example: This component allows hotels to upload and manage room photos to improve visual trust and accuracy.

### **2. Implementation (Exact actions)**

```bash
# FILE: /src/pages/Admin/Rooms.js
# ADD below existing import section
import RoomEditor from '@/components/admin/RoomEditor';

# THEN add at line ~42 (inside <Routes>):
<Route path="/admin/rooms" element={<RoomEditor />} />
```

*(Each code block includes file path, line context, and explicit Add/Delete/Edit markers.)*

### **3. Commit Message**

```
docs(spec): add RoomEditor route (HUB#3)
```

### **4. Confirmation Step**

> ✅ When done, reply **DONE–Rooms.js** or upload a screenshot of the page for validation.

---

## 0) Purpose & Principles

* **Purpose:** Fully automated meeting-room SaaS for hotels/venues — guest can *Search → Customise → Pay → Arrive* with zero manual steps.
* **Admin-first:** Venues curate their own rooms, add‑ons, and pricing; accuracy guaranteed by front‑loading all price data.
* **Single source:** This page is the master reference (UI/fields/logic). Keep steps short; confirm each with **DONE**.

---

## 1) Information Architecture (Admin Console)

**Flow order (left→right tabs after initial setup):**

1. **Venue Setup** (one-time, then editable)
2. **Rooms**
3. **F&B**
4. **AV**
5. **Labour**
6. **3rd-Party Hire-ins**
7. **Add-Ons & Upsells**
8. **VAT**

**Layout:** Fixed header (Venue name + Save All), tab bar below, content panels. Target: compact forms (≈33% viewport depth per section when possible).

**Global actions:**

* **Save All** (top-right) — validates current tab; surfaces errors inline.
* **Discard Changes** (secondary).
* Each tab supports **Add Another …**, **Edit**, **Delete**, and per-record **Save**.

---

## 2) Venue Setup (first‑time screen)

**Goal:** Capture the minimum to enable pricing + calendars for this venue.

**Fields:**

* **Venue Name** (text)
* **Primary Contact Email** (email)
* **Timezone** (select)
* **Default Currency** (select)
* **Address** (multi-line or structured fields)
* **Operating Days/Hours** (weekly schedule picker)
* **Hotel Images**

  * **Main Image** (upload)
  * **Gallery Images** (multi-upload)
* **Global Close-Outs** (optional date-range picker; creates venue-level blackouts)

**Controls:** **Save Venue** (primary), **Edit Later** (enabled after first save).

**Validation:** Required: Name, Email, Timezone, Currency. Save prevents progression to tabs if invalid.

---

## 3) Rooms Tab (A)

**Purpose:** Define one or more meeting rooms with media, features, layouts/capacity, and per‑room controls.

### A.1 Add Room — Fields

1. **Room Name** (text) — *required*
2. **Main Image** — Upload/drag‑drop (single).
3. **More Images** — Upload/drag‑drop (multiple).
4. **Room Features** — Repeatable list:

   * **Feature** (text)
   * Button: **Add another Feature** (appends new row)
5. **Layout Styles** — Repeatable rows:

   * **Layout Type** (select: Boardroom, U‑Shape, Classroom, Theatre, Cabaret, etc.)
   * **Capacity** (number, required)
   * Button: **Add another Layout** (appends new row)

### A.2 Per‑Room Controls

* **Save Room** (saves current room only)
* **Edit** / **Delete** (per room card)
* **Duplicate** (optional, to speed multi‑room setup)

### A.3 Section Controls

* **Save All (Rooms)** — validates all unsaved room cards; shows inline errors per field.

**Notes:** No pricing in Rooms tab; pricing lives in F&B / AV / Labour / 3rd‑Party / Add‑Ons / VAT tabs.

---

## 4) Shared Tab Pattern for Cost Centres (B→G)

All remaining tabs follow identical UX: **repeatable items** with clear **pricing models**. Not all items are time-priced. Each item declares how it charges.

> **Note (Pending DB/Code Check):** Existing DB/UI may only implement time-tiered fields. The following models are locked in spec; we will confirm columns or patch minimally.

### Common Field Set (per item)

* **Item Name** (text) — e.g., “Coffee & Pastries AM”, “Projector 4K”, “Setup Crew”, “External LED Wall”, “Notepads & Pens”, etc.
* **Pricing Model** (select — required):

  * **TIME_TIERED** (Hourly / Half‑Day / Day)
  * **PER_PERSON**
  * **PER_ITEM** (flat)
  * **PER_PERSON_PER_DAY**
  * **PER_ROOM_PER_DAY**
* **Rate Fields (shown based on model):**

  * **Time-based:** Hourly, Half‑Day (≤4h), Day (>4h) with **N/A** toggles
  * **Per Person / Per Item:** **Unit Price**
  * **Per Person per Day / Per Room per Day:** **Unit Price** (× computed *days*)
* **Quantity Controls:**

  * **Allow Quantity** (toggle)
  * **Default Quantity** (number)
  * **Unit Label** (e.g., “projector(s)”, “flipchart(s)”)
* **Category‑specific attributes** (keep minimal)
  Examples: F&B window, AV on‑site/3rd‑party, Labour role, Supplier & lead time, Notes.
* **Tax Class** (select — links to VAT tab)
* **Flags (Pending DB/Code Check):**

  * **Inclusive** (checkbox) — included in base price
  * **Inclusive Threshold (attendees)** (number, optional)
  * **Upsell Eligible** (checkbox)
* **Buttons:** **Save**, **Add another [Item]**, **Delete**, **Edit**

**Tab‑level Controls:** **Save All ([Tab])**, **Discard Changes**

**Notes:**

* **Room base rate** remains time‑tiered (Hourly/Half‑Day/Day).
* Non‑time items rely on the **Pricing Model** above; this removes prior limitation.

---

## 5) VAT Tab (G)

* **Tax Classes** — repeatable rows:

  * **Class Name** (e.g., Standard 23%, Reduced 13.5%)
  * **Rate %**
  * **Applied To** (multi‑select: F&B, AV, Labour, 3rd‑Party, Add‑Ons)
* **Save**, **Add another Tax Class**, **Delete**, **Edit**

---

## 6) Pricing Engine (High‑level Rules)

* **Room base tier:** chosen by booking duration:

  * ≤4 hours → **Half‑Day**
  * > 4 hours → **Day**
  * Hourly possible if enabled; otherwise nearest tier.
* **Item totals by Pricing Model:**

  * **Time-based:** choose appropriate tier field (hourly/half‑day/day) by duration.
  * **Per Person:** `unit × attendee_count`.
  * **Per Item (Flat):** `unit × quantity`.
  * **Per Person per Day:** `unit × attendee_count × days`.
  * **Per Room per Day:** `unit × days`.
* **Taxes:** VAT applied per item’s tax class; summed to grand total.
* **Multi‑day handling:** `days = ceil(total_hours / 8)` for MVP (configurable later).

---

## 7) Calendars & Close‑Out Logic (Overview)

* **Venue‑level blackouts** from Venue Setup apply to all rooms.
* **Room‑level close‑outs** created automatically upon payment (paid reservations = blocked).
* **Manual room close‑outs** (admin‑set) supported via existing blackout function.
* **Conflict rule:** paid reservations take precedence; editing close‑outs cannot displace paid blocks.

---

### 7.1 Add‑Ons & Upsells — Definitions & Construction

**Features vs Add‑Ons**

* **Features** are inherent to the room (e.g., natural light, windows, terrace, AC, wheelchair access). *Informational only; not priced.*
* **Add‑Ons** are optional/variable items (e.g., chilled water, bottled water, pastries, parking, cloakroom). *Priced according to a Pricing Model.*

**Inclusive vs Optional vs Upsell** *(Pending DB/Code Check)*

* **Inclusive**: contributes to base price automatically. Shows to Booker as “Included”.
* **Inclusive Threshold (attendees)**: makes an Add‑On inclusive only when attendee count ≥ threshold (supports your “over X delegates” rule).
* **Optional**: user-selectable; adds to total when checked.
* **Upsell Eligible**: optional items that can be re‑offered contextually before payment.

**Where Upsells appear (MVP)**

1. Leaving each cost‑centre (F&B, AV, etc.).
2. Final review before payment, re‑offering unselected optional items.

**Field checklist inside “Add‑Ons & Upsells” tab (Admin)** *(Pending DB/Code Check)*

* Item Name, **Cost Centre** (F&B / AV / General), **Pricing Model**, Rate fields by model, Quantity controls.
* **Inclusive** (checkbox), **Inclusive Threshold (attendees)** (optional), **Upsell Eligible** (checkbox).
* Display Priority, Tax Class.

**Future (not MVP):** packaged price tiers (Basic/Silver/Gold/Regular Booker) pre‑define Inclusive vs Optional sets.

---

## 8) Admin UX Rules (Consistency)

* Repeatable rows with “Add another …” everywhere; inline validation; minimal required fields.
* Always show **Hourly / Half‑Day / Day** fields on cost tabs with N/A toggles.
* **Save Room** vs **Save All (Rooms)** to support partial entry and bulk commit.
* Undo not required; **Discard Changes** rolls back unsaved edits per tab.

---

## 9) Next Steps (Short, Confirmable)

**Step 1 (now):**

* Confirm corrections: Venue Setup **Hotel Images**, **Add‑Ons & Upsells** tab, and the **Pricing Model** options.
* Reply **DONE–Corrections** or list any tweaks.

**Step 2 (next):**

* I’ll propose a brief **Pricing‑Model Spoke** note (impact review + minimal schema/UI fields) — to ensure no conflict with work to date.

**Step 3:**

* Return to **Rooms Tab** UI with copy‑pasta implementation blocks (file paths + code snippets) for the Admin app skeleton.

**Step 4:**

* MVP Booker UI outline (search → price → alternates → upsells) with implementation blocks.
