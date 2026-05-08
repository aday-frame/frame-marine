# Frame Marine — App Shell Design Polish
**Date:** 2026-05-08
**Status:** Approved

---

## Overview

Improve the visual quality of the app shell (sidebar, topbar, typography, cards) in the Next.js rebuild. No new functionality — this is purely design polish before Phase 2 modules are built.

---

## Design Decisions

### Font: DM Sans
Replace Inter with DM Sans, the same font used in the original Frame Marine app. Load via `next/font/google`. Apply to `<body>` via Tailwind class. DM Sans reads better at small sizes (11–13px) with tighter tracking.

### Icons: Lucide React
Install `lucide-react`. Use Lucide icons everywhere — sidebar nav, topbar buttons, stat cards, empty states. No emojis. No placeholder blocks.

Each sidebar nav item gets a dedicated, semantically appropriate Lucide icon:
- Dashboard → `LayoutDashboard`
- Work Orders → `Wrench`
- Maintenance → `Clock`
- Inventory → `Package`
- Certificates → `FileText`
- Safety & ISM → `ShieldCheck`
- Documents → `File`
- Charter → `CalendarDays`
- Settings → `Settings`

Topbar icons:
- Search → `Search`
- Notifications → `Bell`
- Collapse toggle → `ChevronLeft` / `ChevronRight`
- Workspace chevron → `ChevronDown`

### Sidebar: Collapsible
Default state: expanded (200px), showing icon + text label for every nav item. A collapse toggle button (top-right of sidebar header) collapses to icon-only (48px). Preference stored in `localStorage` so it persists across page loads.

**Expanded sidebar structure:**
- Header: Frame logo mark + "Frame" wordmark + collapse button
- Nav: Section label ("Marine") followed by nav items with icon + label
- Active state: `bg-frame-orange/[.13]` background, orange icon + label
- Inactive state: muted icon + label, subtle hover background
- Footer: User avatar (initials, orange circle) + display name

**Collapsed sidebar (48px):**
- Header: logo mark only (no wordmark, no collapse button — show expand button instead)
- Nav: icon only, centered, with Tooltip showing label on hover
- Footer: avatar only

### Typography
- **Font**: DM Sans everywhere
- **Case**: Title case throughout — no all-caps labels anywhere
- **Page titles**: 20px, weight 600, tracking −0.03em
- **Page subtitles**: 13px, weight 400, `text-frame-ink-subtle`
- **Stat card labels**: 11.5px, weight 500, `text-frame-ink-subtle`
- **Stat card values**: 26px, weight 300, tabular-nums, tracking −0.025em
- **Sidebar section labels**: 10px, weight 600, `text-frame-ink-tertiary`, tracking 0.04em
- **Nav item labels**: 13px, weight 500
- **Breadcrumb**: 12px, inactive segments `text-frame-ink-tertiary`, active `text-frame-ink-muted` weight 500

### Topbar
Left to right:
1. **Workspace switcher**: pill button — orange dot (vessel) or blue dot (property) + workspace name + `ChevronDown`. Background `bg-frame-surface-1`, border `border-frame-hairline`. Opens Clerk org switcher dropdown on click.
2. **Divider**: 0.5px vertical hairline
3. **Breadcrumb**: "Frame › [Module Name]"
4. **Right side**: Search button (icon + "Search" text, same pill style) + notification bell icon button

### Cards: Top-Edge Highlight
All surface cards get a 1px top-edge highlight — a subtle white line at the very top of the card that creates the appearance of a raised surface. Implemented as `::before` pseudo-element or a Tailwind `before:` utility. Color: `rgba(255,255,255,0.09)`.

### Stat Cards (Dashboard)
Each stat card:
- Background: `bg-frame-surface-1`
- Border: 0.5px `border-frame-hairline`
- Border-radius: 9px
- Top-edge highlight (see above)
- Padding: 14px 16px
- Label: 11.5px title case, `text-frame-ink-subtle`
- Value: 26px light, colored per meaning (orange = overdue, amber = warning, red = critical, white = neutral)

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/globals.css` | Switch font to DM Sans via `next/font/google`, add `--font-sans` CSS variable to `@theme` block |
| `src/app/layout.tsx` | Load DM Sans with `next/font/google`, apply font variable class to `<body>` |
| `src/components/shell/Sidebar.tsx` | Collapsible logic, text labels, Lucide icons, section labels, footer with user name |
| `src/components/shell/SidebarNavItem.tsx` | Accept icon prop, show tooltip when collapsed |
| `src/components/shell/Topbar.tsx` | Workspace switcher polish, breadcrumb, search button, notification icon |
| `src/app/(app)/dashboard/page.tsx` | Larger page title/subtitle, updated stat card sizes |
| `package.json` | Add `lucide-react` |

---

## Out of Scope

- Light mode toggle
- Notification system (bell is visual only)
- Search functionality (search button is visual only until Phase 5)
- Any Phase 2+ module content
