# Design Polish — Component System Pass

## Goal

Port the prototype's visual component vocabulary into Tailwind `@layer components` in `globals.css`, then update every existing page component to use it. The result: consistent, prototype-quality styling across Work Orders, Maintenance, and Dashboard — with a single source of truth for every badge, stat number, filter pill, and button.

## Problem

Phase 2 components were built with scattered inline Tailwind utilities. Stat strip numbers are small, status badges are unstyled text or plain surfaces, team badges have no color, filter pills look generic. The prototype has a precise component system that makes everything look polished. We need to match it.

## Architecture

No structural changes. No new routes, no DB changes, no layout restructuring. This is a pure styling pass: add component classes to `globals.css`, update components to use them.

**Tech stack:** Next.js 15 App Router, Tailwind v4, `@layer components` with `@apply`.

---

## Component Vocabulary

All classes added to `src/app/globals.css` inside `@layer components`.

### Badges

Base class applied to every badge. Color variant applied alongside it.

```
.badge          — inline-flex, rounded-full, px-[9px] py-[2px], text-[11px] font-medium whitespace-nowrap
```

**Status variants:**
```
.b-open         — bg-blue-500/10 text-blue-400
.b-progress     — bg-frame-amber/10 text-frame-amber
.b-hold         — bg-amber-400/10 text-amber-400 ring-[0.5px] ring-amber-400/25
.b-done         — bg-frame-green/10 text-frame-green
```

**Priority variants:**
```
.b-high         — bg-frame-red/10 text-frame-red
.b-medium       — bg-frame-orange/10 text-frame-orange
.b-low          — bg-frame-green/10 text-frame-green
```

**Team variants:**
```
.b-engineering  — bg-cyan-400/10 text-cyan-400
.b-deck         — bg-purple-400/10 text-purple-400
.b-interior     — bg-frame-green/10 text-frame-green
.b-charter      — bg-frame-orange/10 text-frame-orange
```

### Stat Numbers

Used in `WorkOrderStatStrip` and `PmsStatStrip`.

```
.stat-num       — text-[52px] font-semibold leading-none tracking-[-0.05em] text-frame-ink tabular-nums
.stat-lbl       — text-[10px] font-semibold uppercase tracking-[0.08em] text-frame-ink-tertiary
```

### Filter Pills

Used in Work Orders and Maintenance filter bars.

```
.fp             — px-3 py-[5px] rounded-full text-[12px] font-medium cursor-pointer border-none
                  text-frame-ink-tertiary bg-transparent transition-colors
                  hover:text-frame-ink-subtle hover:bg-frame-surface-3
.fp.on          — bg-frame-surface-4 text-frame-ink
.fp-sep         — w-px self-stretch bg-frame-hairline-strong mx-1.5 flex-shrink-0
```

### Buttons

Scoped names (`btn-f-*`) to avoid conflict with shadcn.

```
.btn-f-base     — inline-flex items-center gap-1.5 rounded-lg text-[12px] font-medium
                  cursor-pointer border-none transition-colors whitespace-nowrap
.btn-f-primary  — extends btn-f-base: bg-frame-orange text-white px-3 py-[6px]
                  hover:bg-frame-orange-hover
.btn-f-ghost    — extends btn-f-base: bg-transparent text-frame-ink-subtle px-2.5 py-[5px]
                  hover:bg-frame-surface-2 hover:text-frame-ink
.btn-f-sm       — px-2 py-[3px] text-[11px] (modifier, combine with primary/ghost)
```

---

## Files Modified

### `src/app/globals.css`
Add all component classes above inside `@layer components`.

### `src/components/work-orders/WorkOrderStatStrip.tsx`
- Stat numbers: replace current small text with `.stat-num`
- Labels: replace with `.stat-lbl`
- Each stat separated by `border-r border-frame-hairline` with `px-5 py-4` padding

### `src/components/work-orders/WorkOrderList.tsx`
- `TeamBadge`: replace plain surface span with `badge b-engineering` / `b-deck` etc.
- Row `Link`: tighten to `px-3 py-2.5 rounded-lg`
- WO number: `font-mono text-[10px] text-frame-ink-tertiary`

### `src/components/work-orders/WorkOrderDetail.tsx`
- Status selector buttons: replace inline pills with `badge` + status variant (`.b-open` etc.), active state gets ring
- Subtask checkbox: `16×16 rounded border-frame-hairline`, checked = `bg-frame-orange border-frame-orange`
- Comment avatar: `26×26 rounded-full bg-frame-orange`, comment bubble gets `bg-frame-surface-2 rounded-lg px-2.5 py-2`
- Section labels: `text-[10px] font-semibold uppercase tracking-[0.08em] text-frame-ink-tertiary`
- "Add subtask" / "Post comment" buttons: `.btn-f-primary .btn-f-sm` and `.btn-f-ghost .btn-f-sm`

### `src/components/work-orders/WorkOrderSheet.tsx`
- Submit button: `.btn-f-primary`
- Cancel/secondary: `.btn-f-ghost`
- Form labels: `text-[11px] font-medium text-frame-ink-subtle`

### `src/components/maintenance/PmsStatStrip.tsx`
- Same stat-num / stat-lbl treatment as WorkOrderStatStrip
- Overdue number: add `text-frame-red` override; Due Soon: `text-frame-amber`

### `src/components/maintenance/PmsTaskList.tsx`
- `StatusPill`: replace with `badge` + appropriate variant (overdue=`b-high`, due_soon=`b-progress`, upcoming=`b-done`)
- Row link: same tightened padding as WorkOrderList

### `src/components/maintenance/PmsTaskDetail.tsx`
- Buttons: `.btn-f-primary` / `.btn-f-ghost`
- Section labels: same eyebrow treatment

### `src/components/maintenance/AssetHoursPanel.tsx`
- Save/cancel inline buttons: `.btn-f-ghost .btn-f-sm`

### `src/components/dashboard/StatCards.tsx`
- Stat value numbers: `text-[32px] font-semibold leading-none tracking-[-0.04em] text-frame-ink tabular-nums` (smaller than `stat-num` — cards are compact)
- Card: `bg-frame-surface-1 border border-frame-hairline rounded-xl p-4`

### `src/components/dashboard/OpenWorkOrdersList.tsx`
- Team badge: `.badge` + team variant
- Priority dot: keep as-is (already correct)

### `src/components/shell/Sidebar.tsx`
- Active nav item: `bg-frame-surface-2 text-frame-ink` (remove any orange background)
- Disabled nav item: `opacity-30 pointer-events-none`
- Nav item hover: `hover:bg-frame-surface-2 hover:text-frame-ink`

### `src/components/shell/TopbarClient.tsx`
- Add `+ New work order` orange button (`.btn-f-primary`) on the right that opens `WorkOrderSheet`
- Requires making `WorkOrderSheet` usable from topbar (pass `workspaceId` via context or prop)
- Search button: keep as-is, minor tightening

### `src/lib/db/schema/workspaces.ts` (or wherever workspaceId is exposed)
- No changes — topbar reads workspaceId from `useOrganization()` (Clerk, already available client-side)

---

## Workspace ID in Topbar

The topbar `+ New work order` button needs `workspaceId` to call `createWorkOrder`. Solution: read `organization.id` from `useOrganization()` (Clerk client hook) directly inside `TopbarClient` — same pattern used in other client components.

---

## Testing

- Visual check: open Work Orders, Maintenance, Dashboard — stat numbers should be large, badges color-coded, filter pills match prototype
- Functional check: quick-add button in topbar opens sheet and creates a work order successfully
- No regressions in existing server actions (no logic changes)

---

## Out of Scope

- Layout restructuring (full-width topbar, grouped sidebar)
- New pages or modules
- Light theme adjustments
- Mobile-specific design changes beyond what Tailwind responsive handles automatically
