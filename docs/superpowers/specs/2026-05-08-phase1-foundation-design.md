# Frame Marine — Phase 1: Foundation
**Date:** 2026-05-08
**Status:** Approved

---

## Overview

Rebuild Frame Marine as a Next.js 15 application. Phase 1 delivers the foundation everything else builds on: project scaffold, design system, authentication, database, file storage, and the app shell. No operational modules are built in this phase — those come in Phases 2–5.

---

## Project Decomposition

| Phase | Scope |
|-------|-------|
| **1 — Foundation** | Next.js scaffold, Tailwind design system, Clerk auth, Neon DB schema, Vercel Blob, app shell |
| 2 — Core Operations | Dashboard, Work Orders, Planned Maintenance |
| 3 — Vessel Operations | Inventory, Certificates, Safety/ISM, Documents, Logbook |
| 4 — Charter & Finance | Charter, Budget, Hours of Rest / Compliance |
| 5 — Admin & Reporting | Crew, Roles, Owner view, Reports, Monitoring |

---

## Tech Stack

| Concern | Technology |
|---------|-----------|
| Framework | Next.js 15, App Router, TypeScript |
| Auth | Clerk (Organizations model) |
| Database | Neon Postgres via Vercel Marketplace |
| ORM | Drizzle |
| File storage | Vercel Blob |
| UI components | shadcn/ui (customized to Frame tokens) |
| Styling | Tailwind CSS only — no `.css` files |
| Font | Inter via `next/font/google` |

---

## Architecture: Feature-Module

One Next.js app. Code organized by feature module. Each module owns its server actions, DB queries, types, and components. Shared UI primitives live in `src/components/ui/`.

**Folder structure:**
```
src/
  app/
    (auth)/               ← Clerk sign-in, sign-up, onboarding
    (app)/                ← All protected routes
      layout.tsx          ← App shell: sidebar + topbar
      dashboard/
      work-orders/        ← added Phase 2
      inventory/          ← added Phase 3
      ... (one folder per module)
  modules/
    work-orders/          ← server actions, db queries, types
    inventory/
    ... (mirrors app/ routes)
  components/
    ui/                   ← shadcn/ui primitives
    shell/                ← Sidebar, Topbar, WorkspaceSwitcher
  lib/
    db/                   ← Drizzle client + schema
    blob/                 ← Vercel Blob helpers
    auth/                 ← Clerk server helpers
  middleware.ts           ← Clerk route protection
```

**Rendering rules (enforced from day one):**
- Every page under `(app)/` is server-side rendered — no `"use client"` at the page level
- Data fetching happens in Server Components via Drizzle queries directly
- Mutations go through Server Actions in `modules/` — no API route handlers
- `"use client"` only on interactive leaf components (dropdowns, modals, forms)

---

## Auth: Clerk Organizations

### Tenancy model
- Each vessel or property = 1 Clerk Organization (the billing unit: $149/workspace/month)
- A user has one Clerk account and can be a member of multiple organizations
- An owner with 20 vessels = 1 account, 20 org memberships
- Clerk handles invite flows, org switching, and session management natively

### Roles
| Role | Access |
|------|--------|
| `owner` | Full access — operationally identical to captain |
| `captain` | Full access — operationally identical to owner |
| `chief_engineer` | Full engineering modules, read-only on charter/finance |
| `crew` | Assigned work orders, checklists, logbook entries |
| `vendor` | View and update work orders assigned to them only |
| `charter_guest` | Read-only: charter itinerary and vessel info |

`owner` and `captain` are treated identically in permission checks via a shared `isAdmin` helper: `role === 'owner' || role === 'captain'`.

### Auth flow
1. Unauthenticated user → `/sign-in` or `/sign-up` (Next.js pages with embedded Clerk `<SignIn />` / `<SignUp />` components — not redirected to Clerk's hosted domain)
2. After auth, if user has no org → redirect to `/onboarding`
3. Onboarding: create first workspace (name, type: vessel | property, optional photo)
4. Clerk creates the org, user becomes `owner`, redirect to `/dashboard`
5. Returning users with multiple workspaces: last-active org persisted, switchable via topbar

### Middleware
- All routes under `/(app)/` require auth — `middleware.ts` blocks unauthenticated access
- All server-side data queries read `auth().orgId` and filter by workspace — no cross-workspace data leaks
- Role checks happen inside Server Actions before any mutation executes

---

## Database Schema (Phase 1)

Three foundation tables. Every table added in Phases 2–5 will carry a `workspace_id` foreign key back to `workspaces`.

```sql
workspaces
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  clerk_org_id    text UNIQUE NOT NULL
  name            text NOT NULL
  type            text NOT NULL CHECK (type IN ('vessel', 'property'))
  avatar_url      text
  created_at      timestamptz DEFAULT now()
  updated_at      timestamptz DEFAULT now()

workspace_members
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
  workspace_id    uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE
  clerk_user_id   text NOT NULL
  role            text NOT NULL CHECK (role IN ('owner','captain','chief_engineer','crew','vendor','charter_guest'))
  created_at      timestamptz DEFAULT now()
  UNIQUE (workspace_id, clerk_user_id)

profiles
  clerk_user_id   text PRIMARY KEY
  display_name    text NOT NULL
  email           text NOT NULL
  avatar_url      text
  created_at      timestamptz DEFAULT now()
  updated_at      timestamptz DEFAULT now()
```

**Sync strategy:**
- `profiles` is populated and kept current via Clerk webhooks (`user.created`, `user.updated`)
- `workspaces` is written when user completes onboarding (creates org)
- `workspace_members` is written when users are invited to an org (Phase 2+); Phase 1 only writes the creator as `owner`

**Drizzle schema location:** `src/lib/db/schema/` — one file per table (`workspaces.ts`, `members.ts`, `profiles.ts`), re-exported from `index.ts`.

---

## File Storage: Vercel Blob

Used for:
- Workspace (vessel/property) avatar photos
- User profile photos
- Document attachments (Phases 3+)

**Phase 1 usage:** workspace avatar upload during onboarding, user avatar on profile page.

**Helpers:** `src/lib/blob/upload.ts` — a thin wrapper around `@vercel/blob` that enforces consistent path prefixes: `workspaces/{orgId}/avatar`, `users/{userId}/avatar`.

---

## Design System & Tailwind

All visual tokens from `DESIGN.md` are mapped into `tailwind.config.ts` as custom colors under the `frame` namespace. No CSS files. No CSS variables. All styling via Tailwind utility classes.

**Key token mapping (`tailwind.config.ts`):**
```ts
frame: {
  orange:          '#F97316',
  'orange-hover':  '#FB923C',
  'orange-focus':  '#EA6D0E',
  canvas:          '#080808',
  'surface-1':     '#131415',
  'surface-2':     '#191a1b',
  'surface-3':     '#1e1f21',
  'surface-4':     '#232527',
  hairline:        '#242628',
  'hairline-strong':'#2e3033',
  ink:             '#f5f6f7',
  'ink-muted':     '#c8ccd4',
  'ink-subtle':    '#8a8f98',
  'ink-tertiary':  '#545861',
  green:           '#22c55e',
  amber:           '#FBBF24',
  red:             '#f87171',
  blue:            '#60A5FA',
}
```

**shadcn/ui components installed in Phase 1:**
Button, Card, Badge, Avatar, Dialog, DropdownMenu, Separator, Tooltip, Sheet (mobile sidebar), Skeleton.

All shadcn components are customized at install time to use `frame.*` tokens — dark canvas background, orange accent, hairline borders. The rule: always use a shadcn component if one fits; customize with Frame tokens rather than building from scratch.

---

## App Shell

**Layout:** Icon sidebar (56px) + topbar (48px) + content area. Matches current app structure.

### Sidebar (`src/components/shell/Sidebar.tsx`)
- Frame logo at top
- Icon-only nav items: Dashboard, Work Orders, Maintenance, Inventory, Certificates, Safety, Documents, Charter (icons for all future modules included from day one — inactive until Phase adds the route)
- Active state: orange left border + orange icon fill + subtle background
- Tooltips on hover showing module name
- Settings icon above user avatar at bottom
- Collapses to overlay drawer on mobile (Sheet component)

### Topbar (`src/components/shell/Topbar.tsx`)
- WorkspaceSwitcher on the left (shows current workspace name + type indicator dot)
- Breadcrumb showing current module
- Search icon (global search — Phase 5)
- Notifications bell with unread dot (visual only in Phase 1 — no notifications system yet)
- All icons and controls are `"use client"` components; the topbar wrapper is a Server Component

### WorkspaceSwitcher (`src/components/shell/WorkspaceSwitcher.tsx`)
- Dropdown listing all workspaces the user is a member of
- Orange dot = vessel, blue dot = property
- Click switches active org in Clerk session
- "Add workspace" option at bottom → triggers onboarding flow

### Onboarding (`src/app/(auth)/onboarding/`)
- Step 1: Name your workspace
- Step 2: Type (vessel or property)
- Step 3: Optional photo upload (Vercel Blob)
- Creates Clerk org + writes `workspaces` DB row + writes creator as `owner` in `workspace_members`

---

## What Phase 1 Delivers

At the end of Phase 1, the app can:
- Sign up, sign in, sign out via Clerk
- Create a workspace (vessel or property) through onboarding
- Switch between workspaces in the topbar
- Display the app shell (sidebar + topbar) with all module icons present
- Show a placeholder dashboard page (real dashboard content in Phase 2)
- Store and display workspace and user avatar photos via Vercel Blob

It does NOT include: any operational data, work orders, inventory, certificates, or any Phase 2–5 feature.

---

## Out of Scope for Phase 1

- Invite flows (Phase 2+)
- Billing integration
- Vendor / charter guest portal
- Any operational module content
- Mobile app
