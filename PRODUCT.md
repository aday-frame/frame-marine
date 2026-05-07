# Frame Marine — Product Document
**Version 0.1 · May 2026**

---

## Vision

Frame Marine is the operating system for professionally managed vessels. It replaces the scattered stack of spreadsheets, paper logs, WhatsApp threads, and generic project tools that most yachts run on — with a single platform purpose-built for the way vessels actually operate.

The target customer is the owner or captain of a vessel that has professional crew and real operational complexity: maintenance schedules that must be tracked, compliance obligations that carry legal exposure, charter programs that generate revenue, and multiple stakeholders (owner, captain, chief engineer, crew, vendors, guests) who each need a different view of the same information.

Frame Marine is not a task manager on a boat. It is vessel management software — the difference is domain specificity. Systems are marine systems. Zones are vessel zones. Compliance rules reference STCW and ISM. Documents are flag-state certificates. Every screen is built around how a yacht is actually run, not adapted from a generic tool.

**Pricing:** $149 per vessel per month, unlimited users. Add-on modules available on top.

**Design principle:** Clean, fast, offline-capable. SpaceX-grade interface — dark, precise, no clutter. Works on a phone in a noisy engine room.

---

## Core Platform — Included at $149/vessel/month

The core platform covers everything a vessel needs to operate day-to-day. It is not locked or tiered — one subscription gives the whole crew full access to all Operations and Charter functionality.

---

### 1. Dashboard

**The first thing anyone sees when they open Frame Marine.**

A single-screen overview of vessel health. Shows open work orders by priority, the day's scheduled events, key alerts (overdue maintenance, low inventory, upcoming certificate expirations), and quick-access to the most recent activity. Vessel-switching is instant from the top bar — relevant if an owner or management company runs multiple hulls.

**Who uses it:** Owner, captain, chief engineer. Everyone.

---

### 2. Work Orders

**The operational core of the platform.**

Work orders are the unit of work on a vessel — anything that needs to be done, tracked, assigned, and closed. Frame Marine's work order system is built specifically for the multi-department structure of a professional yacht.

- Create work orders with title, system, zone, priority, team assignment, and due date
- Four teams: Engineering, Deck, Interior, Charter
- Subtasks within each work order for step-by-step task tracking
- Comments and activity log on each work order
- Status flow: Open → In Progress → On Hold → Done
- Filters: All, Open, In Progress, On Hold, Done — filtered list groups by team
- Templates: pre-built work order templates for routine jobs (engine checks, provisioning, etc.) — use a template to pre-fill a new WO in one click, which then opens immediately for editing
- Priority flags: High, Medium, Low — high-priority open WOs surface to the top and are highlighted
- Stat strip: live counts of open, in-progress, on-hold, and high-priority WOs

**Who uses it:** Captain, chief engineer, department heads, crew. Owner sees summary on dashboard.

---

### 3. Planned Maintenance System (PMS)

**Scheduled maintenance, not reactive firefighting.**

The PMS tracks every recurring maintenance task on the vessel — by asset, system, interval, and assigned crew member. It tells you what is overdue, what is due soon, and what is healthy.

- Tasks organized by system group (Propulsion, Electrical, Safety, etc.)
- Each task shows: asset, interval, last done, time to next service, progress bar
- Status flags: Overdue (red), Due Soon (amber), Upcoming (green)
- Linked to work orders — completing a task can generate or reference a WO
- Stat strip: overdue count, due-soon count, total active tasks
- Click-through to task detail with full maintenance history

**Who uses it:** Chief engineer, captain. Generates WOs for crew.

---

### 4. Calendar

**One view of everything scheduled on the vessel.**

A month-view calendar plus an upcoming events sidebar. Events are colour-coded by type: Charter (orange), Maintenance (blue), Regulatory (red), Logistics (green).

- Month grid with event pills showing scheduled events per day
- Upcoming sidebar lists all future events in chronological order
- Click any event (in grid or sidebar) to open its detail modal
- From the detail, link directly to the associated work order
- Navigate months forward/backward

**Who uses it:** Captain, owner, charter manager.

---

### 5. Logbook

**The official vessel record.**

A chronological log of voyage entries — port departures, arrivals, weather observations, notable events. Two-pane layout: entry list on the left, full entry detail on the right.

- Log entries with date, port/location, weather conditions, crew on watch, notes
- Categorized: departure, arrival, passage, event
- Searchable and browsable history

**Who uses it:** Captain, officer of the watch.

---

### 6. Checklists

**Operational checklists for departures, arrivals, and routine procedures.**

Pre-departure, arrival, and safety checklists that crew complete in real time. Each checklist is a structured sequence of checks with pass/fail status, notes, and crew sign-off.

- Multiple checklist types: pre-departure, arrival, engine room, safety walkthrough
- Interactive — tap to check off each item
- Completion record with timestamp and crew member

**Who uses it:** Captain, chief engineer, crew.

---

### 7. SOPs (Standard Operating Procedures)

**Written procedures for every critical operation on board.**

A library of step-by-step procedures organized by department (Engine Room, Safety, Deck, Interior). Each SOP is a named procedure with role assignment and an ordered checklist of steps, with optional notes on each step.

- Categories: Engine Room, Safety, Deck, Interior
- Each SOP shows: procedure name, responsible role, number of steps
- Expandable step view with inline guidance notes
- Progress tracking when a procedure is being executed

**Who uses it:** Chief engineer, captain, crew. Critical for handover and training.

---

### 8. Monitoring

**Live sensor data from the vessel's systems.**

Real-time and recent readings from the vessel's monitored systems, displayed as clean instrument panels.

- Engine monitoring: RPM, coolant temp, oil pressure, fuel flow — both engines side by side
- Bilge monitoring: compartment water levels with alarm thresholds
- Climate: cabin-by-cabin temperature readings
- Power & fuel: generator load, battery state, fuel tank levels by compartment
- Alerts surface automatically when readings are outside normal range

**Who uses it:** Chief engineer, captain. Especially useful on mobile when moving around the vessel.

---

### 9. Inventory & Parts

**Spares management — know what you have before you need it.**

A parts register for every consumable and spare on board, organized by zone, category, and supplier.

- Parts list with SKU, description, zone, quantity on hand, minimum stock level
- Low-stock alerts when quantity falls below minimum
- Cost per unit and supplier linked
- Linked to assets — each asset shows its associated parts
- Parts linked to work orders for consumption tracking

**Who uses it:** Chief engineer, captain. Purchasing decisions for provisioning runs.

---

### 10. Tenders & Fleet

**Everything that floats, not just the mother ship.**

A separate module for tenders, jet skis, and other support craft — each with its own status, maintenance record, and linked work orders.

- Fleet list with vessel type, current location (davits, swim platform, in water), and status
- Per-tender detail: specifications, photos, maintenance history
- Status indicators: Ready, In Use, Maintenance
- Linked to WOs and PMS items

**Who uses it:** Deck team, chief engineer.

---

### 11. Crew

**The people running the vessel.**

Crew profiles for everyone on board — their role, contact details, photo, and vessel assignment.

- Crew cards with name, role, initials/avatar, and vessel
- Role-based: Captain, Chief Engineer, Crew/Tech, Interior, Deck
- Foundation for hours of rest tracking (Compliance add-on) and certificate management

**Who uses it:** Captain for management, owner for overview.

---

### 12. Vessel Documents

**The document library for the vessel.**

Centralized storage and organization of all vessel-level documents — class certificates, registration, insurance policies, drawings, manuals.

- Document categories: Certificates, Insurance, Registration, Technical, Manuals
- Upload, view, and download documents
- Linked to certificates module for expiry tracking (Compliance add-on)

**Who uses it:** Captain, owner, management company.

---

### 13. Settings

**Vessel configuration and platform setup.**

Vessel profile (name, flag, class, type, LOA, year), system definitions, zone configuration, and user management.

---

## Charter Module — Included in Core

The Charter module is a full commercial charter management tool built into the base plan. It is relevant for vessels running a charter program — not every customer will use it, but it is included rather than sold separately because it sits alongside operations rather than above it.

---

### Charter

**End-to-end charter booking and management.**

A two-pane layout: charter list on the left, full detail on the right. Manages the full lifecycle of a charter from booking to completion.

- Charter records: guests, dates, itinerary, broker, status (Upcoming, Active, Completed, Enquiry)
- Tabs per charter: Overview, Costs, Guests, Itinerary
- Overview: APA advance tracking, outstanding payments, linked work orders, quick stats
- Costs: line-item cost tracking by category (fuel, provisions, crew expenses, marina fees, etc.)
- Guests: guest profiles linked to the charter, preferences, embarkation
- Itinerary: port-by-port schedule with dates and notes
- Add new charters from enquiry through to confirmed booking
- Costs tab feeds into Owner Suite P&L reporting (if add-on is active)

**Who uses it:** Captain, charter manager, owner.

---

## Add-On Modules

Add-on modules are purpose-built for specific operational contexts that not every vessel needs. They are priced separately because they require meaningful additional setup, generate data that carries regulatory or financial weight, and serve a narrower audience within the customer base.

---

### Compliance Module — $49/vessel/month

**For commercially operated or flag-state compliant vessels.**

The Compliance add-on is for vessels that have real regulatory obligations — MCA, flag state, Lloyd's Register, or similar. It covers three interconnected areas: certificate management, crew hours of rest, and safety management.

**Certificates**
- Registry of all vessel and crew certificates with issuing authority, document reference, issue and expiry dates
- Status flags: Valid, Expiring (within 90 days), Expired
- 30-day and 90-day automated expiry alerts
- Vessel certificates (Safety Management, MARPOL, Load Line, Radio, etc.) and crew certificates (STCW, medical, endorsements) in one view
- Crew competency and endorsement tracking

**Hours of Rest**
- Daily hours of rest log for each crew member — work hours and rest hours per 24-hour period
- IMO/STCW rules enforced: minimum 10h rest per 24h, minimum 77h rest per 7 days, rest split rules
- Violation detection: red flags on any day below the minimum
- 7-day rolling summary per crew member with compliance status
- Log entry modal with auto-calculation (enter work hours, rest populates automatically)
- Crew selector with violation indicators

**Safety & ISM**
- ISM drill records: fire, MOB, abandon ship, flooding — with date, type, conductor, duration, crew present
- Non-conformance reporting: log any incident or near-miss with status tracking and corrective action
- Safety meetings log: topic, conductor, duration, attendees
- Audit-ready record export

**Who needs it:** Any vessel operating commercially, on a charter license, or subject to flag state inspection. Strongly recommended for any vessel with professional crew regardless of commercial status.

---

### Owner Suite — $79/vessel/month

**For owners who want complete financial visibility.**

The Owner Suite gives the vessel owner (or their management company) a clean financial dashboard and reporting layer on top of the operational data. It is not a full accounting system — it is structured financial visibility specific to vessel operations.

**Budget**
- Annual OPEX budget by category (crew salaries, fuel, provisions, marina fees, maintenance, insurance, etc.)
- Live YTD spend vs. budget with variance tracking per category
- Progress bars showing budget consumption — categories over 100% flagged in red
- Monthly cost breakdown by department

**Owner View**
- Executive summary: YTD revenue, YTD costs, YTD net P&L, charter days
- Charter performance table: each charter with dates, gross revenue, costs, net, status
- Fleet status panel: live work order counts, compliance alerts, overdue maintenance
- Branded PDF report generated on demand — one page, shareable with owner

**Who needs it:** Owners who fund the vessel and want financial accountability. Management companies reporting to owner clients. Any operation running a charter program where P&L matters.

---

## Roadmap — Future Add-Ons

These are modules that have been identified as high-value but are not yet built. They are candidates for future add-on pricing.

| Module | What it covers | Target customer |
|---|---|---|
| **Insights** | Fleet-wide analytics, engine hours trends, cost benchmarking vs. comparable vessels | Fleet operators, management companies |
| **Build** | New build and refit project management — milestones, yard liaison, punch lists, budget vs. actuals | Owners in active build or refit |
| **Finance** | Full P&L with invoice management, crew payroll tracking, APA reconciliation, accountant export | Management companies running owner accounts |
| **Vendor Portal** | External vendor login to view and update assigned work orders without full platform access | Contractors, service companies |
| **Guest App** | Charter guest-facing view: itinerary, vessel information, preferences, communication | Charter operations |

---

## Core vs. Add-On — The Principle

**Core:** Anything that helps a vessel run better operationally. Work orders, maintenance, monitoring, checklists, the logbook, inventory — this is the daily rhythm of a professional vessel and every customer needs it. Charter management is also core because it is operationally embedded (charters generate work orders, costs, and documents that live in the core system).

**Add-on:** Anything that is either (a) regulatory-specific and carries compliance weight, (b) financial and serves the owner rather than the crew, or (c) highly specialized and not universally needed. Compliance and Owner Suite are the first two add-ons because they serve distinct buyer roles (compliance officer / flag state requirements; owner / management company) and have clear standalone value that customers will pay for separately.

The goal is to keep the core subscription priced so that the captain or chief engineer can justify it without escalating to the owner — $149/vessel/month is within a department head's discretionary budget for a professionally crewed yacht. Add-ons are sold upward: Compliance requires flag-state awareness, Owner Suite requires owner buy-in on the financial reporting value.

---

## Access & Roles

| Role | Access |
|---|---|
| **Owner** | Full read access to all modules. Owner View by default. Can approve expenditure. |
| **Captain** | Full operational access. Manages crew, approves work orders, logs passages. |
| **Chief Engineer** | Full access to Engineering work orders, PMS, monitoring, inventory. |
| **Crew / Tech** | Assigned work orders and checklists. Limited write access. |
| **Vendor** | (Roadmap) Work orders assigned to them. No internal data. |
| **Charter Guest** | (Roadmap) Guest-facing itinerary and preferences only. |

---

## Technical

- **Offline-first:** IndexedDB + service worker. Full functionality without a connection. Sync when back online.
- **Web-based:** Runs in any browser. No app install required. Installable as a PWA on iOS and Android.
- **Multi-vessel:** One account can manage multiple hulls. Switch between vessels instantly from the top bar.
- **Data model:** Vessels, crew, work orders, assets, parts, events, charters, certificates, logs — all linked relationally and filtered per vessel.
