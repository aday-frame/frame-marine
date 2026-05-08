# Frame Marine — Phase 2: Core Operations
**Date:** 2026-05-08
**Status:** Approved

---

## Overview

Build the three core operational modules: Dashboard (live vessel stats + open work orders), Work Orders (full CRUD with filters, subtasks, comments, status flow), and Planned Maintenance System (recurring tasks with hour-based and date-based intervals, linked to work orders). All modules are server-rendered with Drizzle + Neon Postgres. Mutations go through server actions — no API routes.

---

## Project Context

- **App:** `/Users/albertday/Downloads/frame-marine-app`
- **Stack:** Next.js 15, TypeScript, Tailwind v4, Drizzle ORM, Neon Postgres, Clerk v7
- **Existing schema:** `workspaces`, `profiles`, `workspaceMembers` (in `src/lib/db/schema/`)
- **Rendering rules:** Pages are Server Components. `"use client"` only on interactive leaf components. Server actions in `src/modules/` for all mutations.

---

## Database Schema

### New tables (add to `src/lib/db/schema/`)

#### `assets`
Represents a piece of equipment on the vessel (engines, generators, etc.). Used by PMS tasks to identify what's being maintained and to track running hours.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `workspaceId` | uuid FK → workspaces | |
| `name` | text | e.g. "Port Main Engine" |
| `zone` | text | e.g. "Engine Room" |
| `system` | text | e.g. "Propulsion" |
| `make` | text nullable | |
| `model` | text nullable | |
| `currentHours` | integer nullable | Running hours, updated manually |
| `createdAt` | timestamp | |

#### `workOrders`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `workspaceId` | uuid FK → workspaces | |
| `number` | text | Auto-generated, e.g. "WO-001" |
| `title` | text | |
| `description` | text nullable | |
| `status` | enum | `open`, `in_progress`, `on_hold`, `done` |
| `priority` | enum | `high`, `medium`, `low` |
| `team` | enum | `engineering`, `deck`, `interior`, `charter` |
| `system` | text nullable | e.g. "Propulsion" |
| `zone` | text nullable | e.g. "Engine Room" |
| `assigneeId` | uuid nullable FK → profiles | |
| `createdById` | uuid FK → profiles | |
| `fromPmsTaskId` | uuid nullable FK → pmsTasks | |
| `dueDate` | date nullable | |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

#### `workOrderSubtasks`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `workOrderId` | uuid FK → workOrders | |
| `text` | text | |
| `completed` | boolean | default false |
| `order` | integer | for display ordering |

#### `workOrderComments`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `workOrderId` | uuid FK → workOrders | |
| `authorId` | uuid FK → profiles | |
| `text` | text | |
| `createdAt` | timestamp | |

#### `pmsTasks`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `workspaceId` | uuid FK → workspaces | |
| `assetId` | uuid nullable FK → assets | |
| `system` | text | e.g. "Propulsion" |
| `assetName` | text | Human-readable, e.g. "Port CAT C32" |
| `taskName` | text | e.g. "Engine oil & filter change" |
| `intervalType` | enum | `hours`, `date` |
| `intervalValue` | integer | Hours (e.g. 250) or months (e.g. 6) |
| `lastCompletedAt` | date nullable | |
| `lastCompletedHours` | integer nullable | Only relevant for `hours` interval type |
| `nextDueDate` | date nullable | Calculated for date-based tasks |
| `nextDueHours` | integer nullable | Calculated for hour-based tasks |
| `assigneeId` | uuid nullable FK → profiles | |
| `createdAt` | timestamp | |

#### `pmsCompletionLog`
Records each time a PMS task is marked done. Used to show history in the detail slide-over.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `pmsTaskId` | uuid FK → pmsTasks | |
| `completedById` | uuid FK → profiles | |
| `completedAt` | date | |
| `hoursAtCompletion` | integer nullable | |
| `linkedWorkOrderId` | uuid nullable FK → workOrders | |
| `notes` | text nullable | |
| `createdAt` | timestamp | |

---

## Module 1: Work Orders (`/work-orders`)

### Layout

Two-pane split. List panel on the left (~40% width), detail panel on the right (~60% width). No full-page navigation — everything happens within the two panels.

**URL state:** Selected work order and active filters are reflected in the URL — `/work-orders?id=<uuid>&status=open`. Page reads these from `searchParams` on load so refreshing preserves the view. The `id` param controls which WO is open in the detail panel.

### List Panel

**Stat strip** (top of panel):
- Open / In Progress / On Hold / High Priority — live counts from DB, filtered by workspace

**Filter row:**
- Status tabs: All | Open | In Progress | On Hold | Done
- Priority filter dropdown: All | High | Medium | Low
- Search input: filters by title (client-side on loaded results)

**Work order rows** (sorted by: high priority first, then overdue by due date, then by created date):
- Priority dot: red = high, orange = medium, amber = low, gray = no priority
- WO number (WO-001)
- Title
- Team badge
- Assignee initials (orange circle)
- Due date (red if overdue)
- Active row highlighted with `bg-frame-orange/[.13]`

**New Work Order button** — top-right of page header, opens slide-over

### Detail Panel

Shown when a work order row is selected. Empty state when nothing selected.

**Header:**
- WO number + title (editable inline)
- Status selector: pill buttons for Open / In Progress / On Hold / Done — click to change, triggers `updateWorkOrderStatus` server action
- Priority badge

**Meta grid** (2-column):
- System | Zone
- Team | Assignee
- Due date | Created by

**Description block** — text, editable

**Subtasks section:**
- Progress bar: X of Y complete
- Checklist rows — click to toggle complete, triggers `toggleSubtask`
- Add subtask inline input at bottom

**Comments section:**
- Chronological thread — author initials, text, timestamp
- Add comment form at bottom — textarea + Submit button, triggers `addComment`

### New Work Order Slide-Over

Slides in from the right over the detail panel. Fields:
- Title (required)
- Description
- Priority (select: High / Medium / Low)
- Team (select: Engineering / Deck / Interior / Charter)
- System (text)
- Zone (text)
- Assignee (select from workspace members)
- Due date (date picker)

Submit triggers `createWorkOrder` server action. On success: sheet closes, new WO becomes selected in the list and opens in detail panel.

### Server Actions (`src/modules/work-orders/actions.ts`)

| Action | Description |
|--------|-------------|
| `createWorkOrder(data)` | Creates WO, auto-generates WO number (WO-001, WO-002… — sequential per workspace, zero-padded to 3 digits) |
| `updateWorkOrderStatus(id, status)` | Updates status, sets updatedAt |
| `updateWorkOrderField(id, field, value)` | Generic field update (title, description, priority, etc.) |
| `toggleSubtask(id, completed)` | Flips subtask completed boolean |
| `addSubtask(workOrderId, text)` | Creates new subtask |
| `addComment(workOrderId, text)` | Creates comment with current user as author |

### DB Queries (`src/modules/work-orders/queries.ts`)

| Query | Description |
|-------|-------------|
| `getWorkOrders(workspaceId, filters?)` | Returns list with assignee profile joined |
| `getWorkOrder(id)` | Returns WO with subtasks, comments, assignee |
| `getWorkOrderStats(workspaceId)` | Returns open/in-progress/on-hold/high-priority counts |

---

## Module 2: Planned Maintenance (`/maintenance`)

### Layout

Full-width list (no two-pane split — rows need horizontal space for interval data). Detail opens in a slide-over.

**URL state:** Active filters reflected in URL — `/maintenance?status=overdue&system=Propulsion`.

### Engine Hours Panel

Collapsible panel at top of page. Shows each tracked asset with a running hours field:

```
Port Main Engine    [ 3,047 hrs ]   ← click to edit inline
Stbd Main Engine    [ 3,051 hrs ]
Generator           [   842 hrs ]
```

Updating hours triggers `updateAssetHours` server action and recalculates all hour-based task statuses on the page.

### PMS Task List

**Stat strip:** Overdue / Due Soon / Upcoming counts

**Filter row:** System filter (All | Propulsion | Electrical | Safety | Hull | etc.) + Status filter (All | Overdue | Due Soon | Upcoming)

**Rows** (sorted: overdue first, then due soon, then upcoming; grouped by system):
- Status dot: red = overdue, amber = due soon, green = upcoming
- Task name
- Asset name
- Interval: "Every 250 hrs" or "Every 6 months"
- Last done: date
- Next due: date or hours
- Progress bar: visual fill showing how far through the interval (red when over 100%)
- Status pill: Overdue / Due Soon / Upcoming

**PMS task status calculation:**
- Hour-based: `status = overdue if asset.currentHours >= task.nextDueHours`, `due-soon if within 10% of interval remaining`
- Date-based: `status = overdue if today > nextDueDate`, `due-soon if within 30 days`

### Detail Slide-Over (click any PMS task row)

- Task name, asset, system
- Interval type + value
- Last completed: date + hours at completion
- Next due: calculated date or hours
- **Completion history:** last 5 entries from `pmsCompletionLog` — date, hours, who completed it
- **Log Completion button:** opens inline mini-form: date (default today) + hours at completion (pre-filled from asset.currentHours) + optional notes → triggers `logPmsCompletion`, resets interval forward
- **Create Work Order button:** opens the work order slide-over pre-filled with task name as title, system, assignee

### Server Actions (`src/modules/maintenance/actions.ts`)

| Action | Description |
|--------|-------------|
| `updateAssetHours(assetId, hours)` | Updates currentHours on asset |
| `logPmsCompletion(taskId, data)` | Creates pmsCompletionLog entry, updates pmsTasks.lastCompletedAt, recalculates nextDueDate/nextDueHours |
| `createWorkOrderFromPms(taskId)` | Creates WO pre-filled from task, sets fromPmsTaskId |

### DB Queries (`src/modules/maintenance/queries.ts`)

| Query | Description |
|-------|-------------|
| `getPmsTasks(workspaceId, filters?)` | Returns tasks with asset joined |
| `getPmsTask(id)` | Returns task with completion history |
| `getPmsStats(workspaceId)` | Returns overdue/due-soon/upcoming counts |
| `getAssets(workspaceId)` | Returns assets with currentHours |

---

## Module 3: Dashboard (`/dashboard`)

### Layout

Page title: vessel name (from Clerk org name). Subtitle: "Dashboard".

### Stat Cards (4, top row)

| Card | Value source | Color | Link |
|------|-------------|-------|------|
| Open Work Orders | `count(work_orders where status in (open, in_progress))` | white | `/work-orders?status=open` |
| Overdue Maintenance | `count(pms_tasks where status = overdue)` — calculated from hours/dates | orange | `/maintenance?status=overdue` |
| Certs Expiring | Hardcoded `0` (Phase 3) | amber | — |
| Low Stock Items | Hardcoded `0` (Phase 3) | red | — |

Stat cards are clickable (except placeholders) — navigate to the relevant filtered module view.

### Open Work Orders List

Below the stat cards. Shows all work orders where status is `open` or `in_progress`, sorted by priority (high first) then due date.

Each row:
- Priority dot
- WO number + title
- Team badge
- Assignee initials
- Due date (red if overdue)

Click any row → navigate to `/work-orders` with that WO pre-selected.

"View all work orders →" link at bottom of list.

### Server Queries (run in the page Server Component)

- `getWorkOrderStats(workspaceId)` — for stat cards
- `getPmsStats(workspaceId)` — for overdue maintenance count
- `getOpenWorkOrders(workspaceId)` — for the list, limit 10

---

## File Structure

```
src/
  app/(app)/
    dashboard/
      page.tsx              ← updated (was placeholder)
    work-orders/
      page.tsx              ← new
    maintenance/
      page.tsx              ← new
  modules/
    work-orders/
      actions.ts            ← server actions
      queries.ts            ← db queries
      types.ts              ← WorkOrder, Subtask, Comment types
    maintenance/
      actions.ts
      queries.ts
      types.ts              ← PmsTask, Asset, CompletionLog types
  components/
    work-orders/
      WorkOrderList.tsx     ← list panel (server)
      WorkOrderDetail.tsx   ← detail panel (client — status changes, subtask toggles, comments)
      WorkOrderSheet.tsx    ← new WO slide-over (client)
      WorkOrderFilters.tsx  ← filter row (client)
      WorkOrderStatStrip.tsx ← stat counts (server)
    maintenance/
      PmsTaskList.tsx       ← task list (server)
      PmsTaskDetail.tsx     ← detail slide-over (client)
      AssetHoursPanel.tsx   ← engine hours editor (client)
      PmsStatStrip.tsx      ← stat counts (server)
    dashboard/
      StatCards.tsx         ← 4 stat cards (server)
      OpenWorkOrdersList.tsx ← WO list (server)
  lib/db/schema/
    work-orders.ts          ← new schema file
    maintenance.ts          ← new schema file
```

---

## Sidebar Nav

Enable the Work Orders and Maintenance nav items in `Sidebar.tsx` (currently `disabled={true}`).

---

## Out of Scope

- Photo upload on work orders (Phase 3 with Vercel Blob)
- Crew hours of rest (Phase 4)
- Certificate management (Phase 3)
- Inventory / low stock tracking (Phase 3)
- WO templates (future)
- Recurring work orders (future)
