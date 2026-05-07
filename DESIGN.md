---
version: 1.0
name: Frame
description: "A near-black operations platform built around #080808 (deep charcoal canvas), light gray text (#f5f6f7), and Frame orange (#F97316) as the single chromatic accent. The system reads as professional vessel-management software: dense, data-forward, and precise. Interface type is set in Inter at 400–600 with measured negative tracking. Cards sit as charcoal panels (#131415) with hairline borders. The orange accent appears on the brand mark, primary CTAs, active nav states, and focus rings — used sparingly so it signals importance. Page rhythm leans on tight data tables, stat bars, and slide-in detail panels rather than atmospheric color or hero imagery."

colors:
  primary: "#F97316"
  on-primary: "#080808"
  primary-hover: "#FB923C"
  primary-focus: "#EA6D0E"
  ink: "#f5f6f7"
  ink-muted: "#c8ccd4"
  ink-subtle: "#8a8f98"
  ink-tertiary: "#545861"
  canvas: "#080808"
  surface-1: "#131415"
  surface-2: "#191a1b"
  surface-3: "#1e1f21"
  surface-4: "#232527"
  hairline: "#242628"
  hairline-strong: "#2e3033"
  hairline-tertiary: "#383b3f"
  semantic-green: "#22c55e"
  semantic-amber: "#FBBF24"
  semantic-red: "#f87171"
  semantic-blue: "#60A5FA"
  semantic-overlay: "#000000"

typography:
  display-xl:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: -1.6px
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: -1.0px
  display-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: -0.5px
  headline:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.3px
  card-title:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.30
    letterSpacing: -0.2px
  subhead:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.40
    letterSpacing: -0.1px
  body-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  body:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: 0
  label:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: 600
    lineHeight: 1.30
    letterSpacing: 0.07em
  button:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.01em
  mono:
    fontFamily: ui-monospace, SF Mono, Menlo
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 10px
  xl: 12px
  xxl: 16px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  section: 48px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 7px 14px
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 7px 12px
    border: "1px solid {colors.hairline-strong}"
  button-ghost-hover:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline-tertiary}"
  stat-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-lg}"
    padding: 18px 22px
    border-right: "0.5px solid {colors.hairline}"
  data-table:
    backgroundColor: "{colors.canvas}"
    headerBackground: "{colors.surface-1}"
    headerTextColor: "{colors.ink-subtle}"
    rowBorderColor: "{colors.hairline}"
    rowHoverBackground: "{colors.surface-1}"
  detail-panel:
    backgroundColor: "{colors.surface-1}"
    width: 480px
    padding: 20px
    border-left: "0.5px solid {colors.hairline}"
  badge-open:
    backgroundColor: "rgba(248,113,113,.15)"
    textColor: "#f87171"
    rounded: "{rounded.xs}"
    padding: 2px 7px
  badge-done:
    backgroundColor: "rgba(34,197,94,.12)"
    textColor: "#22c55e"
    rounded: "{rounded.xs}"
    padding: 2px 7px
  badge-hold:
    backgroundColor: "rgba(251,191,36,.12)"
    textColor: "#FBBF24"
    rounded: "{rounded.xs}"
    padding: 2px 7px
  badge-review:
    backgroundColor: "rgba(96,165,250,.12)"
    textColor: "#60A5FA"
    rounded: "{rounded.xs}"
    padding: 2px 7px
  modal:
    backgroundColor: "{colors.surface-2}"
    width: 520px
    maxWidth: 92vw
    rounded: "{rounded.xl}"
    padding: 24px
    border: "0.5px solid {colors.hairline}"
  input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 8px 12px
    border: "0.5px solid {colors.hairline-strong}"
  nav-sidebar:
    backgroundColor: "{colors.canvas}"
    width: 220px
    border-right: "0.5px solid {colors.hairline}"
  nav-item-active:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    accentColor: "{colors.primary}"
  tab-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink-subtle}"
    borderBottom: "2px solid transparent"
    padding: 8px 12px
  tab-button-active:
    textColor: "{colors.ink}"
    borderBottom: "2px solid {colors.primary}"
---

## Overview

Frame's app canvas is a deep near-black charcoal — `{colors.canvas}` (#080808) — elevated through a four-step surface ladder for cards, panels, modals, and nested tiles. Hairline borders (`{colors.hairline}` #242628 through `{colors.hairline-tertiary}`) carry visual hierarchy without shadow. Light text (`{colors.ink}` #f5f6f7) runs body and headlines.

The single chromatic accent is **Frame orange** `{colors.primary}` (#F97316). It appears on the brand mark, primary CTAs, the active nav indicator, focus rings, and key numeric callouts. A lighter hover state (`{colors.primary-hover}` #FB923C) and a pressed variant (`{colors.primary-focus}` #EA6D0E) extend the hue. Orange is intentionally scarce — when it appears, it signals "this is the thing to act on."

Semantic colors cover the full operational palette: green for done/success, amber for on-hold/warning, red for open issues/high priority, blue for in-progress/marine context. These are data-ink colors used in badges, status indicators, and stat callouts — never as surface fills or section backgrounds.

**Key Characteristics:**
- **Deep-charcoal operations surface** — `{colors.canvas}` (#080808) grounds the system.
- **Orange brand accent** (`{colors.primary}` #F97316) — used scarcely: brand mark, primary CTA, active nav, focus ring.
- Four-step surface ladder (canvas → surface-1 → surface-2 → surface-3 → surface-4) without shadow.
- **Data-first layout**: stat bars with large numbers, `.tbl` tables, slide-in detail panels.
- All three tabs within a module must use the same layout pattern as the module's primary view.
- Tight negative tracking on display sizes; zero tracking on body.

## Colors

### Brand & Accent
- **Frame Orange** ({colors.primary}): Brand mark, primary CTA, active nav strip, focus ring. Never use as a section background or decorative fill.
- **Orange Hover** ({colors.primary-hover}): Hovered primary button and interactive orange elements.
- **Orange Focus** ({colors.primary-focus}): Pressed-state CTA; focus-ring tint on inputs.

### Surface
- **Canvas** ({colors.canvas}): Default app background — #080808.
- **Surface 1** ({colors.surface-1}): One step above canvas — sidebar, table headers, hover states.
- **Surface 2** ({colors.surface-2}): Two steps — modals, detail panels, active inputs.
- **Surface 3** ({colors.surface-3}): Three steps — nested info blocks within panels.
- **Surface 4** ({colors.surface-4}): Four steps — deepest lifted surface; rarely used.
- **Hairline** ({colors.hairline}): Standard 0.5px card borders and row dividers.
- **Hairline Strong** ({colors.hairline-strong}): Input borders, modal borders, stronger dividers.
- **Hairline Tertiary** ({colors.hairline-tertiary}): Ghost button hover borders.

### Text
- **Ink** ({colors.ink}): All headlines and primary body type — #f5f6f7.
- **Ink Muted** ({colors.ink-muted}): Secondary labels, ghost button text — #c8ccd4.
- **Ink Subtle** ({colors.ink-subtle}): Table headers, meta info, deselected tab labels — #8a8f98.
- **Ink Tertiary** ({colors.ink-tertiary}): Timestamps, footnotes, placeholder text — #545861.

### Semantic
- **Green** ({colors.semantic-green}): Done, completed, on board, success.
- **Amber** ({colors.semantic-amber}): On hold, warning, scheduled.
- **Red** ({colors.semantic-red}): Open, overdue, high priority, non-conformance.
- **Blue** ({colors.semantic-blue}): In progress, marine, review state.

## Typography

### Font Family
**Inter** — system sans-serif fallback stack: `Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`. Used at all scales from display to caption. The operational context demands legibility at small sizes over expressiveness at large sizes.

**Mono** — `ui-monospace, SF Mono, Menlo` — reserved for reference numbers (WO IDs, NC refs, IMO numbers), timestamps, and code fields.

### Hierarchy

| Token | Size | Weight | Letter Spacing | Use |
|---|---|---|---|---|
| `{typography.display-lg}` | 40px | 600 | -1.0px | Stat bar numbers |
| `{typography.display-md}` | 28px | 600 | -0.5px | Page KPI values |
| `{typography.headline}` | 20px | 600 | -0.3px | Page titles, section headers |
| `{typography.card-title}` | 16px | 600 | -0.2px | Card headlines, panel titles |
| `{typography.subhead}` | 14px | 500 | -0.1px | Nav items, tab labels, form labels |
| `{typography.body}` | 13px | 400 | 0 | Default body text, table cells |
| `{typography.body-sm}` | 12px | 400 | 0 | Secondary table cells, meta |
| `{typography.caption}` | 11px | 400 | 0 | Captions, badge text |
| `{typography.label}` | 10px | 600 | 0.07em | Eyebrow labels, section dividers (uppercase) |
| `{typography.button}` | 13px | 600 | -0.01em | All button labels |
| `{typography.mono}` | 12px | 400 | 0 | IDs, refs, timestamps |

### Principles
- **Stat bar numbers** use `{typography.display-lg}` (40–52px) — the large number is the primary signal.
- **Positive tracking** only on uppercase `{typography.label}` tokens (0.07em) — all else neutral or negative.
- **Table cells** default to 12–13px, never smaller than 11px.
- **Mono** only for identifiers: "WO-2025-042", "NC-2026-003", IMO numbers, etc.

## Layout

### Spacing System
- Base unit: 4px.
- Card interior padding: `{spacing.xl}` 24px standard; `{spacing.lg}` 20px for compact views.
- Table cell padding: 8px vertical · 12–16px horizontal.
- Page wrapper padding: 18–20px horizontal.

### Page Structure Pattern

Every operational page follows this order:
1. **Stat bar** — full-width grid of `.wo-stat` cells with large numbers and labeled metrics.
2. **Action bar** — right-aligned primary + ghost buttons ("+ New …").
3. **Tab row** (if tabbed) — `.tab-btn` / `.tab-btn-active` with `border-bottom` indicator.
4. **Data table** — `.tbl-wrap` / `.tbl` with sticky `<thead>`.
5. **Detail panel** — `openPanel()` slide-in right panel for record detail, triggered from table rows.

Every tab within a module must use the same table layout as the primary view. Cards are reserved only for contexts where visual identity matters more than density (e.g., Portfolio cards, avatar-heavy Crew cards).

### Stat Bar Pattern

```html
<div style="display:grid;grid-template-columns:repeat(N,1fr);border-bottom:.5px solid var(--bd)">
  <div class="wo-stat">
    <div class="wo-stat-num" style="color:var(--grn)">12</div>
    <div class="wo-stat-lbl">Label</div>
  </div>
  <!-- last cell: style="border-right:none" -->
</div>
```

`.wo-stat-num` renders at 52px / weight 600. Color tinting: green for positive, amber for warning, red for critical, unstyled for neutral totals.

### Table Pattern

```html
<div class="tbl-wrap">
  <table class="tbl">
    <thead><tr>
      <th>Column</th>
      <th style="width:NNpx">Fixed</th>
      <th style="width:NNpx"></th>  <!-- actions column, no label -->
    </tr></thead>
    <tbody>
      <tr style="cursor:pointer" onclick="Module.openDetail('id')">
        <td>...</td>
      </tr>
    </tbody>
  </table>
</div>
```

Section group rows (Scheduled / Completed, etc.):
```html
<tr><td colspan="N" style="padding:10px 12px 6px;font-size:9px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:.09em;background:var(--bg);border-bottom:.5px solid var(--bd)">Section label</td></tr>
```

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 (flat) | Canvas background, no border | Page root, sidebar |
| 1 (charcoal lift) | Surface-1 background, 0.5px hairline | Table rows (hover), sidebar items |
| 2 (panel) | Surface-2 background, 0.5px hairline-strong | Modals, detail panels |
| 3 (nested block) | Surface-3 background | Info blocks inside panels, input areas |
| Focus ring | 2px `{colors.primary-focus}` outline | Focused input, focused button |

No drop shadows on dark backgrounds. Depth is carried entirely by surface lift + hairline borders.

## Components

### Buttons

**`button-primary`** — Frame orange CTA.
- Background `{colors.primary}`, text `{colors.on-primary}`, 13px/600, padding 7px 14px, `{rounded.md}`.
- Hover: `{colors.primary-hover}` background.
- Pressed: `{colors.primary-focus}` background.

**`button-ghost`** — Secondary action. Used alongside primary for "Cancel", "Filter", "Export".
- Transparent background, `{colors.ink-muted}` text, `{colors.hairline-strong}` border, 13px/600.

**`button-xs`** — Inline row actions (table cell buttons).
- Same variants, padding 4px 8px, font-size 11px.

### Badges

| Class | Color | Background | Use |
|---|---|---|---|
| `.b-high` | `{colors.semantic-red}` | rgba(248,113,113,.15) | Open, overdue, high priority |
| `.b-done` | `{colors.semantic-green}` | rgba(34,197,94,.12) | Completed, closed, on board |
| `.b-hold` | `{colors.semantic-amber}` | rgba(251,191,36,.12) | On hold, scheduled, pending |
| `.b-blue` | `{colors.semantic-blue}` | rgba(96,165,250,.12) | In progress, marine, review |

Badges use 9–10px text, weight 600, `{rounded.xs}` 4px, padding 2px 7px.

### Stat Cards (`.wo-stat`)

The standard stat module. Used at the top of every data-heavy page.
- `padding: 18px 22px` — generous to make numbers breathe.
- `border-right: 0.5px solid var(--bd)` — separates cells without gaps.
- Last cell overrides to `border-right: none`.
- `.wo-stat-num`: 52px / 600 / tabular-nums. Color-tint the number, not the cell.
- `.wo-stat-lbl`: 10px / 600 / uppercase / 0.08em tracking / `{colors.ink-subtle}`.

### Modals

Standard form modal. Never full-screen.
- Background `{colors.surface-2}`, width 520px, max-width 92vw, `{rounded.xl}`, padding 24px.
- Header row: 14px/600 title left, `×` dismiss button right.
- Action row at bottom: ghost cancel + orange primary submit, right-aligned.
- Inputs use `.inp` class — 0.5px `{colors.hairline-strong}` border, `{colors.surface-2}` background.

### Detail Panel

Slide-in from the right. Triggered by `openPanel(html)`.
- Width 480px, background `{colors.surface-2}`, `border-left: 0.5px solid var(--bd)`.
- Padding 20px.
- Top: title + status badge row. Below: 2-column meta grid. Below: text sections. Bottom: action buttons row with `border-top: 0.5px solid var(--bd)`.

## Do's and Don'ts

### Do

- Reserve `{colors.primary}` orange for: brand mark, primary CTA, active nav indicator, focus ring, key accent numbers.
- Use the four-step surface ladder for hierarchy. Avoid skipping levels.
- Give every data-heavy page a stat bar at the top — the large numbers are the first thing the user should read.
- Use `.tbl-wrap` / `.tbl` for all list data. Consistent column widths matter.
- Use `openPanel()` for record detail — slide-in is the app's standard detail pattern.
- Apply `{typography.label}` (uppercase, 0.07em tracking) only for section eyebrows, never inline labels.
- Make every tab in a tabbed module use a table, not cards.

### Don't

- Don't use orange as a card background, section fill, or badge background.
- Don't mix badge colors arbitrarily — the four semantic colors (red / green / amber / blue) map to fixed states.
- Don't use inline style blocks for layout that belongs in `.tbl`, `.wo-stat`, or CSS classes.
- Don't add atmospheric gradients or spotlight cards.
- Don't use `box-shadow` as the primary depth signal on dark surfaces — use surface lift instead.
- Don't ship layout that breaks below 768px — test every page at mobile width.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Desktop | 1280px+ | Full sidebar + main; stat bar 4-up |
| Tablet | 769–1080px | Sidebar collapses; stat bar 2-up |
| Mobile | ≤768px | Sidebar hidden; bottom nav; stat bar 2-up or stacked; tables scroll horizontally |

### Stat Bar Mobile

- At ≤768px, stat bars collapse to 2-column grid: `grid-template-columns: 1fr 1fr`.
- Numbers scale down: `.wo-stat-num` reduces to 36px at mobile.

### Tables Mobile

- `.tbl-wrap` scrolls horizontally on mobile (`overflow-x: auto`).
- Fixed-width columns may drop below their specified widths; the title column expands to fill.

## Iteration Guide

1. Every new data page starts with stat bar → action bar → table. No exceptions.
2. New status states must map to one of the four semantic colors. Don't invent a fifth.
3. New badge states use `.badge` + one of `b-high / b-done / b-hold / b-blue`.
4. Orange only flows to the primary button, brand mark, active nav, focus ring, and numeric callouts where the number itself is orange-significant.
5. If adding a tabbed module, all tabs must render a table (or empty state), never cards.

## Known Gaps

- Budget page is not yet implemented.
- Calendar page is a stub.
- Light mode is not implemented and not planned.
- Property-specific detail pages (beyond Portfolio card view) are not yet designed.
