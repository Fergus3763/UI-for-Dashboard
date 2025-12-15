# Project Context — Automated Meeting Room Booking Platform

## 1. Business Background

I am working with a company in the hospitality sector.

They have successfully developed and deployed a **SaaS platform for Hotels to market and manage their Spas and treatments**. That product is **fully automated for the end user** (the hotel’s spa customer):

From clicking “Book a Treatment” → through offers, information, filtering, terms & conditions, payment → to arriving for the treatment, **there is no human engagement required from the hotel side**.

The system works commercially and operationally.

My work here is to create a **similar SaaS offering for Meeting Rooms**, aimed primarily at:
- Hotels
- Venues with rentable meeting/workspace rooms

The goals are:
- **Speed up sales**
- **Reduce operational cost**
- **Increase confidence in price accuracy for both parties**

---

## 2. The Market Problem We Are Solving

Meeting room booking today is **slow, labour-intensive, and expensive** for both:
- The room booker
- The hotel / venue

Traditionally:
- Meeting rooms were booked via **human-to-human engagement**
- Or via an online enquiry followed by **manual follow-up and confirmation**

This works tolerably well for **large events with long lead times**.

### Post-Covid Shift

Covid fundamentally changed the market:
- Large gatherings declined
- Small, short-notice meetings increased

There is now a **significant, under-served market**:
- Small team meetings (typically **2–20 people**)
- On-demand
- Short duration (often hours, not days)
- Low tolerance for friction

This market:
- Wants **instant pricing**
- Wants **instant booking**
- Does **not** want email chains or sales calls

For hotels, this segment:
- Has **lower revenue per booking**
- Has **high labour cost**
- Is often commercially unattractive to handle manually

---

## 3. The Core Solution

We aim to **fully automate the meeting room booking process**, end-to-end, in the same way the Spa SaaS did.

From the room booker’s perspective:
- Search
- Customise
- See price instantly
- Pay
- Arrive

From the hotel’s perspective:
- No human intervention required
- Price integrity guaranteed
- Margins protected

### Critical Requirement: Confidence

For this to work, **both parties must have supreme confidence** in the price:

- The **hotel** must trust that:
  - Every cost element is included
  - No hidden losses exist
  - The system produces the *same price they would calculate themselves*

- The **booker** must trust that:
  - The price shown is final
  - No surprises appear later
  - The contract is clear at the moment of payment

The contractual moment is:
> **[BUY] → [ORDER CONFIRMED]**

---

## 4. Why This System Must Support All Room Sizes

Hotels will **not** buy or operate two systems:
- One for large events
- One for small meetings

Even though:
- Large events will always involve human-to-human engagement
- Small meetings are the primary automation target

**Our system must support all room sizes and configurations**, because:
- Hotels demand a single source of truth
- Price accuracy benefits *all* bookings
- Setup effort must be reusable across rooms

The setup process for the hotel administrator is more detailed than they are used to — but:
- It is done once
- It can be replicated easily
- It gives unprecedented insight into pricing and margins

Over time, hotels will be able to:
- See true cost composition
- Adjust price points
- Maintain consistent margins across all booking types

---

## 5. Complexity of Meeting Room Pricing

Meeting room booking is complex because of the number of variables involved, including:

- Number of attendees
- Duration (hours / days)
- Room layouts (Boardroom, U-Shape, Classroom, etc.)
- Inclusive services
- Optional services
- Add-ons across multiple cost centres:
  - F&B
  - AV
  - Labour
  - Third-party hire-ins
  - Other custom items
- VAT handling

Each room:
- May have multiple configurations
- Must have its own **availability calendar**
- Must respect:
  - Existing paid bookings
  - Hotel blackout days
  - Administrator-defined closures

Hotels must be able to:
- Close out dates or periods at will
- Trust that unavailable inventory cannot be sold

---

## 6. Front-Loading the Intelligence

To achieve full automation, hotels must **front-load all price creators**:

- Every rule
- Every cost
- Every variable

This requires:
- A detailed but usable Admin UI
- A database capable of answering *every possible query* required to automate:
  - Search
  - Customisation
  - Pricing
  - Payment

This is non-negotiable for price integrity.

---

## 7. How to Work With Me (Critical)

I am **not technical**.

I do, however:
- Understand the hotel and workspace business deeply
- Understand the market problem
- Know exactly what the solution should look like visually
- Know how it should *feel* to use

I have:
- A basic understanding of GitHub and Netlify
- **No desire to learn new tools unless absolutely necessary**

### Absolute Rules

1. **Single Source of Truth**
   - At all times, I must be able to see *all agreed work* in a **single page/file**
   - If it is not in that page/file: **IT DOES NOT EXIST**

2. **Short, Controlled Steps**
   - 2–4 short steps per post
   - Explicit **DONE** confirmation requested from me for each step

3. **No Unnecessary Explanation**
   - If work is visible in GitHub or Netlify, no preamble is needed
   - If I have a problem, I will ask

---

## 8. Hub & Spoke Operating Model (Critical)

Processing capacity must be protected at all times.

Creating a new Hub is:
- Onerous
- Risky
- Potentially detrimental to the project

Therefore:

- The **Hub**:
  - Owns architecture, logic, pricing rules, UI direction
  - Manages Spokes
  - Protects system integrity and continuity

- **Spokes**:
  - Do focused development or heavy lifting
  - Work from tightly defined prompts
  - Are disposable and task-specific
  - Do NOT accumulate long-term context

The decision to:
- Spin out a Spoke **vs**
- Do the work directly as Hub

Must be based on:
- Time to write a prompt vs time to code
- Token/capacity cost of walking *me* through work
- Risk of fragmenting context

I expect the **Hub to propose Spokes proactively** where appropriate.

---

## 9. Summary

This project exists to:
- Automate meeting room booking
- Restore confidence in pricing
- Reduce cost
- Increase speed
- Serve a post-Covid market reality

Accuracy, clarity, and confidence are **not optional** — they are the product.

Everything else is secondary.
