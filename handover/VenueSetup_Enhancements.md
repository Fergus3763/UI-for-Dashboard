# Venue Setup – Enhancements & Future Improvements  
### Handover Document (Living File)  
**Location:** `/handover/VenueSetup_Enhancements.md`  
**Owner:** HUB#6  
**Purpose:** Collect all future improvements for the Venue Setup and Booking Policy / Terms sections.  
**Use:** Do *not* implement immediately. These items are reviewed and activated later as grouped enhancements during a future HUB or SPOKE.

---

## 1. Overview  
This document is a **central holding area** for improvements to the Venue Setup and Booking Policy / Terms UI.  
It allows the OWNER and all future HUBs to:

- Park ideas without introducing drift  
- Avoid piecemeal or patch-driven changes  
- Group related improvements into clean, safe batches  
- Maintain architectural clarity  
- Support clear planning across HUB cycles

---

# 2. Enhancement Categories

Enhancements are grouped by section:

1. **Venue Setup**  
2. **Booking Policy / Terms**  
3. **Shared or System-Wide Enhancements**  
4. **Ready for SPOKE** (fully scoped & ready for implementation)

Each enhancement includes:

- **Summary** – plain English  
- **Why It Matters** – purpose, value  
- **Notes** – any early technical considerations  
- **Priority** – Low / Medium / High (OWNER decides)

---

# 3. Venue Setup Enhancements

### 3.1 Image Handling Improvements  
**Summary:** Allow drag-and-drop uploads for images instead of requiring URLs.  
**Why It Matters:** Reduces friction for venue managers; prevents broken URLs.  
**Notes:**  
- Supabase Storage is the natural long-term solution.  
- Can reuse same fields (`main_image`, `more_images`) without schema changes.  
**Priority:** Medium  

### 3.2 Rich Venue Description  
**Summary:** Replace the plain textarea with a simple rich-text editor.  
**Why It Matters:** Venues often want structured text.  
**Notes:** Keep output as HTML or clean markdown.  
**Priority:** Low  

### 3.3 Additional Address Fields (Optional)  
**Summary:** Allow granular address fields beyond the current fields.  
**Why It Matters:** Useful for international venues.  
**Notes:** Only if needed; current system works fine.  
**Priority:** Low  

---

# 4. Booking Policy / Terms Enhancements

### 4.1 Drag-and-Drop PDF Uploads  
**Summary:** Let the user upload PDF documents for Terms and Privacy sections.  
**Why It Matters:** Easier than pasting URLs; reduces link rot.  
**Notes:**  
- Store files in Supabase Storage.  
- Continue storing URLs in existing `documents` arrays.  
**Priority:** Medium  

### 4.2 Rich Text Editing for Terms  
**Summary:** Replace the plain text input with a basic rich-text editor.  
**Why It Matters:** Clearer formatting for guests.  
**Notes:**  
- Keep final output stored as HTML.  
- Important for future public “Terms” rendering.  
**Priority:** Medium  

### 4.3 Hold-Time Preview  
**Summary:** Show a simple human-readable summary:  
“Small: 30 minutes, Medium: 2 hours, Large: 1 day.”  
**Why It Matters:** Helps ensure correctness when editing.  
**Priority:** Low  

### 4.4 Custom Hold-Time Categories  
**Summary:** Allow more categories beyond Small/Medium/Large.  
**Why It Matters:** Some venues have specialised requirements.  
**Notes:**  
- Requires careful planning to avoid breaking Booker logic.  
**Priority:** Low  

---

# 5. Shared or System-Wide Enhancements

### 5.1 Validation UX Refresh  
**Summary:** Replace small red text errors with consistent banner messages.  
**Why It Matters:** Clearer for the user; matches modern admin UIs.  
**Priority:** Medium  

### 5.2 Auto-Save (Optional)  
**Summary:** Save automatically when user switches tabs.  
**Why It Matters:** Reduces accidental loss of edits.  
**Notes:**  
- Requires confirmation dialogs.  
- Must stay stable with Supabase.  
**Priority:** Low  

### 5.3 Section-Level Reset  
**Summary:** Reset Venue fields or Booking Policy fields to defaults.  
**Why It Matters:** Useful during onboarding.  
**Priority:** Low  

---

# 6. Ready for SPOKE (Fully Scoped – Do Not Implement Until Activated)

*(This section starts empty and is filled by future HUBs.)*

When any enhancement becomes “ready for implementation,” HUB will copy it here with:

- Clear scope  
- File list  
- Behaviour specification  
- Acceptance tests  

CRITICAL: To ensure no loss of memory
*Hub MUST Save all Prompts used to activate Spoke as .MD files
*In addaition Hub MUST save messages to and from Spoke via the owner by appending to Prompts
*HUB MUST name the new Spoke

Once in this section, a SPOKE can be assigned.
 
---

# 7. Governance Notes (HUB-Level)

- This file must **never contain code**.  
- Enhancements must be plain English only.  
- Do not reference older chat logs; rewrite ideas clearly here.  
- Any change to this file must be committed with:  
  `docs(handover): update VenueSetup enhancements list`

---

# 8. Status
**Maintained by:** HUB#6  
**Last Updated:** (update date before commit)  
