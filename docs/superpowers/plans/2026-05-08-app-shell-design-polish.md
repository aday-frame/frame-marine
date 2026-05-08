# App Shell Design Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the visual quality of the Frame Marine Next.js app shell — DM Sans font, Lucide icons, collapsible sidebar with text labels, polished topbar, and better dashboard typography.

**Architecture:** Five self-contained tasks, each touching 1–2 files. No new routes or server-side changes — all changes are client components and styling. The project is at `/Users/albertday/Downloads/frame-marine-app`.

**Tech Stack:** Next.js 16, Tailwind v4 (CSS `@theme`, no `tailwind.config.ts`), shadcn/ui with `@base-ui/react` (`render` prop not `asChild`), `lucide-react` (already installed at v1.14.0), Clerk v7.

---

## File Map

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Switch `Inter` → `DM_Sans` from `next/font/google` |
| `src/app/globals.css` | Update `--font-family-sans` to reference `--font-dm-sans` |
| `src/components/shell/SidebarNavItem.tsx` | New prop type `icon: LucideIcon`, support `collapsed` prop for icon-only vs icon+label |
| `src/components/shell/Sidebar.tsx` | Full rewrite: collapsible, section label, Lucide icons, user footer, localStorage persistence |
| `src/components/shell/TopbarClient.tsx` | Lucide `Search`/`Bell` icons, search as pill with text label, 44px height |
| `src/app/(app)/dashboard/page.tsx` | Larger title/subtitle, title case labels, light stat values |
| `src/components/ui/card.tsx` | Add top-edge highlight (`before:` pseudo-element) |

---

### Task 1: Switch Font to DM Sans

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update layout.tsx**

Replace the entire file:

```tsx
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })

export const metadata: Metadata = {
  title: 'Frame Marine',
  description: 'Vessel operations platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={dmSans.variable}>
        <body className="bg-frame-canvas text-frame-ink antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Step 2: Update globals.css font token**

Find this line in `src/app/globals.css` (inside `@theme`):
```css
--font-family-sans: var(--font-inter), 'Inter', system-ui, sans-serif;
```

Replace it with:
```css
--font-family-sans: var(--font-dm-sans), 'DM Sans', system-ui, sans-serif;
```

- [ ] **Step 3: Verify build passes**

```bash
cd /Users/albertday/Downloads/frame-marine-app
npm run build
```

Expected: Build succeeds, no TypeScript errors. The output should show `✓ Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: switch font from Inter to DM Sans"
```

---

### Task 2: Update SidebarNavItem for Expanded/Collapsed Modes

**Files:**
- Modify: `src/components/shell/SidebarNavItem.tsx`

The component currently accepts `icon: React.ReactNode` and always renders icon-only. This task changes `icon` to accept a `LucideIcon` component, and adds a `collapsed` prop. When `collapsed=false` it shows icon + label; when `collapsed=true` it shows icon only with a tooltip (existing behavior).

- [ ] **Step 1: Replace SidebarNavItem.tsx**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type SidebarNavItemProps = {
  href: string
  label: string
  icon: LucideIcon
  disabled?: boolean
  collapsed?: boolean
}

export function SidebarNavItem({
  href,
  label,
  icon: Icon,
  disabled = false,
  collapsed = false,
}: SidebarNavItemProps) {
  const pathname = usePathname()
  const isActive = !disabled && pathname.startsWith(href)

  const inner = (
    <div
      className={cn(
        'flex items-center rounded-lg transition-colors',
        collapsed ? 'h-9 w-9 justify-center' : 'w-full gap-2.5 px-2.5 py-2',
        isActive
          ? 'bg-frame-orange/[.13] text-frame-orange'
          : disabled
          ? 'cursor-not-allowed text-frame-ink-tertiary opacity-40'
          : 'cursor-pointer text-frame-ink-tertiary hover:bg-frame-surface-2 hover:text-frame-ink-subtle'
      )}
    >
      <Icon size={15} className="flex-shrink-0" />
      {!collapsed && (
        <span className="text-[13px] font-medium leading-none">{label}</span>
      )}
    </div>
  )

  const element = disabled ? inner : (
    <Link href={href} className={collapsed ? undefined : 'w-full'}>
      {inner}
    </Link>
  )

  if (!collapsed) return element

  return (
    <TooltipProvider delay={300}>
      <Tooltip>
        <TooltipTrigger render={element} />
        <TooltipContent
          side="right"
          className="border-frame-hairline bg-frame-surface-2 text-xs text-frame-ink-muted"
        >
          {label}{disabled ? ' — coming soon' : ''}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/albertday/Downloads/frame-marine-app
npx tsc --noEmit
```

Expected: No errors. (Sidebar.tsx will error until Task 3 updates it — that's fine, fix it in Task 3.)

- [ ] **Step 3: Commit**

```bash
git add src/components/shell/SidebarNavItem.tsx
git commit -m "feat: update SidebarNavItem to accept LucideIcon and collapsed prop"
```

---

### Task 3: Rebuild Sidebar — Collapsible with Lucide Icons

**Files:**
- Modify: `src/components/shell/Sidebar.tsx`

The sidebar is fully rewritten. Desktop: 200px expanded by default, collapses to 52px icon-only via a toggle button. Preference stored in `localStorage` under key `'frame-sidebar-collapsed'`. Mobile: unchanged Sheet behavior. Lucide icons throughout. Section label "Marine" above nav items. User avatar + name in footer.

- [ ] **Step 1: Replace Sidebar.tsx**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  LayoutDashboard,
  Wrench,
  Clock,
  Package,
  FileText,
  ShieldCheck,
  File,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Settings,
  Anchor,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SidebarNavItem } from './SidebarNavItem'
import { cn } from '@/lib/utils'

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon; enabled: boolean }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, enabled: true },
  { href: '/work-orders', label: 'Work Orders', icon: Wrench, enabled: false },
  { href: '/maintenance', label: 'Maintenance', icon: Clock, enabled: false },
  { href: '/inventory', label: 'Inventory', icon: Package, enabled: false },
  { href: '/certificates', label: 'Certificates', icon: FileText, enabled: false },
  { href: '/safety', label: 'Safety & ISM', icon: ShieldCheck, enabled: false },
  { href: '/documents', label: 'Documents', icon: File, enabled: false },
  { href: '/charter', label: 'Charter', icon: CalendarDays, enabled: false },
]

const STORAGE_KEY = 'frame-sidebar-collapsed'

function SidebarContent({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const { user } = useUser()
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?'
    : '?'
  const displayName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? ''

  return (
    <div
      className={cn(
        'flex h-full flex-shrink-0 flex-col border-r border-frame-hairline bg-[#0d0e0f] transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-[52px] items-center' : 'w-[200px]'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex h-11 flex-shrink-0 items-center border-b border-frame-hairline',
          collapsed ? 'justify-center' : 'gap-2 px-3'
        )}
      >
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-frame-orange">
          <Anchor size={13} className="text-black/40" />
        </div>
        {!collapsed && (
          <>
            <span className="flex-1 text-[14px] font-semibold tracking-[-0.03em] text-frame-ink">
              Frame
            </span>
            <button
              onClick={onToggle}
              className="flex h-5 w-5 items-center justify-center rounded text-frame-ink-tertiary transition-colors hover:bg-frame-surface-3 hover:text-frame-ink-subtle"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={12} />
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <div
        className={cn(
          'flex flex-1 flex-col gap-0.5 overflow-y-auto py-2',
          collapsed ? 'items-center px-1.5' : 'px-2'
        )}
      >
        {!collapsed && (
          <div className="px-2 pb-1 pt-2 text-[10px] font-semibold tracking-[0.04em] text-frame-ink-tertiary">
            Marine
          </div>
        )}
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            disabled={!item.enabled}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* Footer */}
      <div
        className={cn(
          'flex flex-shrink-0 flex-col border-t border-frame-hairline py-2',
          collapsed ? 'items-center gap-1 px-1.5' : 'px-2'
        )}
      >
        {collapsed && (
          <button
            onClick={onToggle}
            className="mb-1 flex h-9 w-9 items-center justify-center rounded-lg text-frame-ink-tertiary transition-colors hover:bg-frame-surface-2 hover:text-frame-ink-subtle"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={15} />
          </button>
        )}
        <SidebarNavItem
          href="/settings"
          label="Settings"
          icon={Settings}
          disabled
          collapsed={collapsed}
        />
        <div
          className={cn(
            'flex items-center gap-2',
            collapsed ? 'mt-1 justify-center' : 'mt-1 w-full rounded-lg px-2 py-1'
          )}
        >
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-frame-orange text-[9px] font-bold text-white">
            {initials}
          </div>
          {!collapsed && (
            <span className="min-w-0 flex-1 truncate text-[12px] text-frame-ink-subtle">
              {displayName}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') setCollapsed(true)

    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  if (isMobile) {
    return (
      <>
        <Sheet>
          <SheetTrigger
            render={
              <button
                className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-frame-orange shadow-lg md:hidden"
                aria-label="Open navigation"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M2 5h14M2 9h14M2 13h14"
                    stroke="#080808"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            }
          />
          <SheetContent
            side="left"
            className="w-[200px] border-r border-frame-hairline bg-[#0d0e0f] p-0"
          >
            <SidebarContent collapsed={false} onToggle={() => {}} />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return <SidebarContent collapsed={collapsed} onToggle={toggle} />
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/albertday/Downloads/frame-marine-app
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add src/components/shell/Sidebar.tsx
git commit -m "feat: rebuild sidebar with collapsible layout, Lucide icons, section labels, user footer"
```

---

### Task 4: Polish Topbar

**Files:**
- Modify: `src/components/shell/TopbarClient.tsx`

Replace inline SVG icons with Lucide `Search` and `Bell`. Change search from a square icon button to a pill-shaped button with icon + "Search" text. Reduce height from `h-12` (48px) to `h-11` (44px). Improve breadcrumb separator to `›`.

- [ ] **Step 1: Replace TopbarClient.tsx**

```tsx
'use client'

import { Search, Bell } from 'lucide-react'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'

type TopbarClientProps = { breadcrumb: string }

export function TopbarClient({ breadcrumb }: TopbarClientProps) {
  return (
    <div className="flex h-11 flex-shrink-0 items-center gap-3 border-b border-frame-hairline bg-[#0c0c0e] px-4">
      <WorkspaceSwitcher />

      <div className="h-4 w-px flex-shrink-0 bg-frame-hairline" />

      <div className="flex items-center gap-1.5 text-[12px]">
        <span className="text-frame-ink-tertiary">Frame</span>
        <span className="text-frame-hairline-strong">›</span>
        <span className="font-medium text-frame-ink-muted">{breadcrumb}</span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          className="flex items-center gap-1.5 rounded-lg border border-frame-hairline bg-frame-surface-1 px-3 py-1.5 text-[12px] text-frame-ink-tertiary transition-colors hover:bg-frame-surface-2 hover:text-frame-ink-subtle"
          aria-label="Search (coming soon)"
        >
          <Search size={12} />
          Search
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-frame-hairline bg-frame-surface-1 text-frame-ink-tertiary transition-colors hover:bg-frame-surface-2 hover:text-frame-ink-subtle"
          aria-label="Notifications (coming soon)"
        >
          <Bell size={14} />
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/albertday/Downloads/frame-marine-app
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/shell/TopbarClient.tsx
git commit -m "feat: polish topbar — Lucide icons, search pill, 44px height"
```

---

### Task 5: Update Dashboard Typography and Card Top-Edge Highlight

**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`
- Modify: `src/components/ui/card.tsx`

Dashboard: larger page title (20px), larger subtitle (13px), title-case stat labels at 11.5px/medium, light-weight 26px stat values with tabular-nums. Card component: add 1px top-edge highlight via `before:` pseudo-element — the subtle white line at the top of every card that gives depth.

- [ ] **Step 1: Replace dashboard/page.tsx**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const STAT_CARDS = [
  { label: 'Open Work Orders', value: '—', colorClass: 'text-frame-ink' },
  { label: 'Overdue Maintenance', value: '—', colorClass: 'text-frame-orange' },
  { label: 'Certs Expiring', value: '—', colorClass: 'text-frame-amber' },
  { label: 'Low Stock Items', value: '—', colorClass: 'text-frame-red' },
] as const

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] font-semibold leading-tight tracking-[-0.03em] text-frame-ink">
          Dashboard
        </h1>
        <p className="mt-1 text-[13px] text-frame-ink-subtle">Vessel overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CARDS.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="px-4 pb-1 pt-4">
              <CardTitle className="text-[11.5px] font-medium text-frame-ink-subtle">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <span
                className={`text-[26px] font-light leading-none tracking-[-0.025em] tabular-nums ${stat.colorClass}`}
              >
                {stat.value}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-sm text-frame-ink-tertiary">
            Dashboard content arrives in Phase 2
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Add top-edge highlight to card.tsx**

In `src/components/ui/card.tsx`, find the `Card` component's `className`. The current string starts with:
```
"group/card flex flex-col gap-4 overflow-hidden rounded-lg bg-frame-surface-1 py-4 ...
```

Add `relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/[0.09]` to it:

```tsx
function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card relative flex flex-col gap-4 overflow-hidden rounded-lg bg-frame-surface-1 py-4 text-sm text-frame-ink border border-frame-hairline shadow-sm before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/[0.09] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg",
        className
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 3: Run build**

```bash
cd /Users/albertday/Downloads/frame-marine-app
npm run build
```

Expected: `✓ Compiled successfully`, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/dashboard/page.tsx src/components/ui/card.tsx
git commit -m "feat: update dashboard typography and add card top-edge highlight"
```

---

### Final Step: Deploy

- [ ] **Push to GitHub and verify Vercel build**

```bash
git push
```

Expected: Vercel build triggers automatically. Confirm on the Vercel dashboard that the build passes and the production URL shows the updated design.
