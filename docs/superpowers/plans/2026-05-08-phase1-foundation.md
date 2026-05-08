# Frame Marine Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Frame Marine Next.js 15 app with Clerk auth (Organizations), Neon Postgres + Drizzle, Vercel Blob, a Frame-themed Tailwind + shadcn/ui design system, and the full app shell (icon sidebar + topbar + workspace switcher).

**Architecture:** Feature-module Next.js App Router app. All pages under `(app)/` are server-side rendered. Data fetching via Drizzle in Server Components. Mutations via Server Actions in `src/modules/`. `"use client"` only on interactive leaf components (dropdowns, modals, forms).

**Tech Stack:** Next.js 15 (App Router), TypeScript, Clerk Organizations, Neon Postgres via Vercel Marketplace, Drizzle ORM, Vercel Blob, shadcn/ui, Tailwind CSS only (no `.css` files beyond directives).

**Spec:** `docs/superpowers/specs/2026-05-08-phase1-foundation-design.md`

---

## File Map

```
frame-marine-app/              ← new Next.js project (sibling to current vanilla app)
  src/
    app/
      layout.tsx               ← Root layout: ClerkProvider + Inter font
      globals.css              ← @tailwind directives + body base styles only
      page.tsx                 ← Redirect to /dashboard
      (auth)/
        layout.tsx             ← Centered auth layout, dark background
        sign-in/[[...sign-in]]/page.tsx
        sign-up/[[...sign-up]]/page.tsx
        onboarding/
          page.tsx             ← Server: redirect if already has org
          _components/
            OnboardingForm.tsx ← "use client" multi-step form
      (app)/
        layout.tsx             ← Protected: auth check + AppShell
        dashboard/
          page.tsx             ← Placeholder stat cards (Phase 2 fills content)
      api/
        webhooks/
          clerk/
            route.ts           ← POST: Clerk webhook → sync profiles table
    components/
      ui/                      ← shadcn/ui primitives (auto-generated)
      shell/
        Sidebar.tsx            ← "use client": icon nav, active state, mobile drawer
        SidebarNavItem.tsx     ← Icon + tooltip, active state logic
        Topbar.tsx             ← Server wrapper
        TopbarClient.tsx       ← "use client": WorkspaceSwitcher + bells
        WorkspaceSwitcher.tsx  ← "use client": Clerk org list dropdown
    lib/
      db/
        index.ts               ← Drizzle client (Neon HTTP driver)
        schema/
          workspaces.ts        ← workspaces table
          members.ts           ← workspace_members table + ROLES const
          profiles.ts          ← profiles table
          index.ts             ← re-exports all schema
      blob/
        upload.ts              ← uploadAvatar() helper
      auth/
        helpers.ts             ← isAdmin(), getCurrentRole()
        __tests__/
          helpers.test.ts
    modules/
      workspaces/
        actions.ts             ← createWorkspace server action
        queries.ts             ← getWorkspaceByOrgId()
        __tests__/
          actions.test.ts
  middleware.ts                ← Clerk: protect (app)/, redirect no-org to /onboarding
  tailwind.config.ts           ← Frame design tokens
  next.config.ts
  drizzle.config.ts
  .env.local.example
```

---

## Task 1: Scaffold Next.js App

**Files:**
- Create: `next.config.ts`, `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `.env.local.example`

- [ ] **Step 1: Create the Next.js project**

From the parent directory of the current repo (e.g. `~/Downloads`):

```bash
npx create-next-app@latest frame-marine-app \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --no-eslint \
  --import-alias "@/*"
cd frame-marine-app
```

Expected: project created, dependencies installed, dev server verifiable.

- [ ] **Step 2: Install base dependencies**

```bash
npm install @neondatabase/serverless drizzle-orm
npm install -D drizzle-kit
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: server at http://localhost:3000 with default Next.js page. Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 app with TypeScript and Tailwind"
```

---

## Task 2: Frame Design System (Tailwind Config)

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace tailwind.config.ts with Frame tokens**

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        frame: {
          orange:            '#F97316',
          'orange-hover':    '#FB923C',
          'orange-focus':    '#EA6D0E',
          canvas:            '#080808',
          'surface-1':       '#131415',
          'surface-2':       '#191a1b',
          'surface-3':       '#1e1f21',
          'surface-4':       '#232527',
          hairline:          '#242628',
          'hairline-strong': '#2e3033',
          'hairline-3':      '#383b3f',
          ink:               '#f5f6f7',
          'ink-muted':       '#c8ccd4',
          'ink-subtle':      '#8a8f98',
          'ink-tertiary':    '#545861',
          green:             '#22c55e',
          amber:             '#FBBF24',
          red:               '#f87171',
          blue:              '#60A5FA',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Update globals.css (Tailwind directives + body base only)**

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-frame-canvas text-frame-ink;
  }
}
```

- [ ] **Step 3: Update root layout with Inter font**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Frame Marine',
  description: 'Vessel operations platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-frame-canvas text-frame-ink antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify background is near-black**

```bash
npm run dev
```

Open http://localhost:3000. Page background should be `#080808`. Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts src/app/globals.css src/app/layout.tsx
git commit -m "feat: add Frame design tokens to Tailwind config"
```

---

## Task 3: Install and Theme shadcn/ui

**Files:**
- Create: `components.json`, `src/lib/utils.ts`
- Create: `src/components/ui/` (auto-generated)

- [ ] **Step 1: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted: Style → **Default**, Base color → **Slate**, CSS variables → **No**.

- [ ] **Step 2: Verify components.json has cssVariables: false**

The file should contain:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": false
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [ ] **Step 3: Install Phase 1 shadcn components**

```bash
npx shadcn@latest add button card badge avatar dialog dropdown-menu separator tooltip sheet skeleton
```

Expected: all components created in `src/components/ui/`.

- [ ] **Step 4: Retheme Button to Frame orange**

Open `src/components/ui/button.tsx`. Replace the `variants` object in the `buttonVariants` cva call:

```tsx
variants: {
  variant: {
    default:
      'bg-frame-orange text-frame-canvas hover:bg-frame-orange-hover shadow',
    destructive:
      'bg-frame-red text-frame-ink shadow-sm hover:bg-frame-red/90',
    outline:
      'border border-frame-hairline-strong bg-transparent hover:bg-frame-surface-2 text-frame-ink shadow-sm',
    secondary:
      'bg-frame-surface-2 text-frame-ink-muted hover:bg-frame-surface-3 shadow-sm',
    ghost:
      'hover:bg-frame-surface-2 text-frame-ink-subtle hover:text-frame-ink',
    link:
      'text-frame-orange underline-offset-4 hover:underline',
  },
  size: {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-md px-8',
    icon: 'h-9 w-9',
  },
},
```

- [ ] **Step 5: Retheme Card to Frame surface**

Open `src/components/ui/card.tsx`. Replace the `className` on the `Card` forwardRef:

```tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-frame-hairline bg-frame-surface-1 text-frame-ink shadow-sm',
        className
      )}
      {...props}
    />
  )
)
```

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ src/lib/utils.ts components.json
git commit -m "feat: install and theme shadcn/ui with Frame design tokens"
```

---

## Task 4: Install Clerk and Configure Middleware

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/middleware.ts`
- Create: `.env.local.example`

- [ ] **Step 1: Install Clerk**

```bash
npm install @clerk/nextjs
```

- [ ] **Step 2: Create .env.local.example**

```bash
# .env.local.example

# Clerk — from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Neon Postgres — from Vercel Marketplace → Storage → Neon
DATABASE_URL=postgresql://...

# Vercel Blob — from Vercel Marketplace → Storage → Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Clerk Webhooks — from Clerk dashboard → Webhooks
CLERK_WEBHOOK_SECRET=whsec_...
```

Copy to `.env.local` and fill in real values from your Clerk dashboard.

- [ ] **Step 3: Wrap root layout with ClerkProvider**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Frame Marine',
  description: 'Vessel operations platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="bg-frame-canvas text-frame-ink antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Step 4: Create middleware.ts**

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth()

  if (isPublicRoute(req)) return NextResponse.next()

  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  if (!orgId && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

- [ ] **Step 5: Verify middleware redirects unauthenticated users**

```bash
npm run dev
```

Navigate to http://localhost:3000. Expected: redirected to `/sign-in`. Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/middleware.ts .env.local.example
git commit -m "feat: install Clerk and configure route protection middleware"
```

---

## Task 5: Auth Pages (Sign In / Sign Up)

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Create: `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

- [ ] **Step 1: Create auth layout**

```tsx
// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-frame-canvas flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-frame-orange rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-frame-canvas rounded-sm" />
            </div>
            <span className="text-frame-ink font-semibold text-lg tracking-tight">Frame</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create sign-in page**

```tsx
// src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: 'w-full',
          card: 'bg-frame-surface-1 border border-frame-hairline shadow-none rounded-xl',
          headerTitle: 'text-frame-ink',
          headerSubtitle: 'text-frame-ink-subtle',
          socialButtonsBlockButton:
            'border-frame-hairline-strong bg-frame-surface-2 text-frame-ink hover:bg-frame-surface-3',
          dividerLine: 'bg-frame-hairline',
          dividerText: 'text-frame-ink-tertiary',
          formFieldLabel: 'text-frame-ink-muted',
          formFieldInput:
            'bg-frame-surface-2 border-frame-hairline-strong text-frame-ink focus:border-frame-orange focus:ring-frame-orange',
          formButtonPrimary: 'bg-frame-orange hover:bg-frame-orange-hover text-frame-canvas',
          footerActionLink: 'text-frame-orange hover:text-frame-orange-hover',
        },
      }}
    />
  )
}
```

- [ ] **Step 3: Create sign-up page**

```tsx
// src/app/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: 'w-full',
          card: 'bg-frame-surface-1 border border-frame-hairline shadow-none rounded-xl',
          headerTitle: 'text-frame-ink',
          headerSubtitle: 'text-frame-ink-subtle',
          socialButtonsBlockButton:
            'border-frame-hairline-strong bg-frame-surface-2 text-frame-ink hover:bg-frame-surface-3',
          dividerLine: 'bg-frame-hairline',
          dividerText: 'text-frame-ink-tertiary',
          formFieldLabel: 'text-frame-ink-muted',
          formFieldInput:
            'bg-frame-surface-2 border-frame-hairline-strong text-frame-ink focus:border-frame-orange focus:ring-frame-orange',
          formButtonPrimary: 'bg-frame-orange hover:bg-frame-orange-hover text-frame-canvas',
          footerActionLink: 'text-frame-orange hover:text-frame-orange-hover',
        },
      }}
    />
  )
}
```

- [ ] **Step 4: Test auth pages look correct**

```bash
npm run dev
```

Navigate to http://localhost:3000/sign-in. Expected: dark card (`#131415`), Frame orange submit button, styled inputs. Navigate to `/sign-up` — same styling. Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(auth)/"
git commit -m "feat: add Clerk sign-in and sign-up pages with Frame styling"
```

---

## Task 6: Neon Postgres + Drizzle Setup

**Files:**
- Create: `drizzle.config.ts`
- Create: `src/lib/db/index.ts`

- [ ] **Step 1: Create drizzle.config.ts**

```ts
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

- [ ] **Step 2: Create Drizzle client**

```ts
// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

- [ ] **Step 3: Add DB scripts to package.json**

In `"scripts"`:
```json
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio",
"db:generate": "drizzle-kit generate"
```

- [ ] **Step 4: Commit**

```bash
git add drizzle.config.ts src/lib/db/index.ts package.json
git commit -m "feat: add Drizzle ORM client and config for Neon Postgres"
```

---

## Task 7: Database Schema

**Files:**
- Create: `src/lib/db/schema/workspaces.ts`
- Create: `src/lib/db/schema/members.ts`
- Create: `src/lib/db/schema/profiles.ts`
- Create: `src/lib/db/schema/index.ts`

- [ ] **Step 1: Create workspaces schema**

```ts
// src/lib/db/schema/workspaces.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkOrgId: text('clerk_org_id').notNull().unique(),
  name: text('name').notNull(),
  type: text('type', { enum: ['vessel', 'property'] }).notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Workspace = typeof workspaces.$inferSelect
export type NewWorkspace = typeof workspaces.$inferInsert
```

- [ ] **Step 2: Create workspace_members schema**

```ts
// src/lib/db/schema/members.ts
import { pgTable, text, timestamp, uuid, unique } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces'

export const ROLES = [
  'owner',
  'captain',
  'chief_engineer',
  'crew',
  'vendor',
  'charter_guest',
] as const

export type Role = (typeof ROLES)[number]

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    clerkUserId: text('clerk_user_id').notNull(),
    role: text('role', { enum: ROLES }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.workspaceId, t.clerkUserId)]
)

export type WorkspaceMember = typeof workspaceMembers.$inferSelect
export type NewWorkspaceMember = typeof workspaceMembers.$inferInsert
```

- [ ] **Step 3: Create profiles schema**

```ts
// src/lib/db/schema/profiles.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  clerkUserId: text('clerk_user_id').primaryKey(),
  displayName: text('display_name').notNull(),
  email: text('email').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
```

- [ ] **Step 4: Create schema index**

```ts
// src/lib/db/schema/index.ts
export * from './workspaces'
export * from './members'
export * from './profiles'
```

- [ ] **Step 5: Push schema to Neon**

Ensure `DATABASE_URL` is set in `.env.local`, then:

```bash
npm run db:push
```

Expected:
```
[✓] Changes applied:
  - Created table `workspaces`
  - Created table `workspace_members`
  - Created table `profiles`
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/db/schema/
git commit -m "feat: add Drizzle schema for workspaces, members, and profiles"
```

---

## Task 8: Auth Helpers

**Files:**
- Create: `src/lib/auth/helpers.ts`
- Create: `src/lib/auth/__tests__/helpers.test.ts`

- [ ] **Step 1: Install Jest**

```bash
npm install -D jest @types/jest ts-jest jest-environment-node
npx ts-jest config:init
```

Add to `package.json` scripts: `"test": "jest"`

- [ ] **Step 2: Write failing tests**

```ts
// src/lib/auth/__tests__/helpers.test.ts
import { isAdmin, getCurrentRole } from '../helpers'

describe('isAdmin', () => {
  it('returns true for owner', () => {
    expect(isAdmin('owner')).toBe(true)
  })
  it('returns true for captain', () => {
    expect(isAdmin('captain')).toBe(true)
  })
  it('returns false for chief_engineer', () => {
    expect(isAdmin('chief_engineer')).toBe(false)
  })
  it('returns false for crew', () => {
    expect(isAdmin('crew')).toBe(false)
  })
  it('returns false for vendor', () => {
    expect(isAdmin('vendor')).toBe(false)
  })
  it('returns false for charter_guest', () => {
    expect(isAdmin('charter_guest')).toBe(false)
  })
})

describe('getCurrentRole', () => {
  it('returns the role when valid', () => {
    expect(getCurrentRole('owner')).toBe('owner')
    expect(getCurrentRole('crew')).toBe('crew')
  })
  it('returns null for unknown role', () => {
    expect(getCurrentRole('superadmin')).toBeNull()
  })
  it('returns null for undefined', () => {
    expect(getCurrentRole(undefined)).toBeNull()
  })
})
```

- [ ] **Step 3: Run test to confirm failure**

```bash
npm test -- src/lib/auth/__tests__/helpers.test.ts
```

Expected: `FAIL` — `Cannot find module '../helpers'`

- [ ] **Step 4: Implement helpers**

```ts
// src/lib/auth/helpers.ts
import { ROLES, type Role } from '@/lib/db/schema'

export function isAdmin(role: Role | string | null | undefined): boolean {
  return role === 'owner' || role === 'captain'
}

export function getCurrentRole(role: string | null | undefined): Role | null {
  if (!role) return null
  if ((ROLES as readonly string[]).includes(role)) return role as Role
  return null
}
```

- [ ] **Step 5: Run test to confirm pass**

```bash
npm test -- src/lib/auth/__tests__/helpers.test.ts
```

Expected:
```
PASS src/lib/auth/__tests__/helpers.test.ts
  isAdmin
    ✓ returns true for owner
    ✓ returns true for captain
    ✓ returns false for chief_engineer
    ✓ returns false for crew
    ✓ returns false for vendor
    ✓ returns false for charter_guest
  getCurrentRole
    ✓ returns the role when valid
    ✓ returns null for unknown role
    ✓ returns null for undefined

Tests: 9 passed, 9 total
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth/
git commit -m "feat: add isAdmin and getCurrentRole helpers with tests"
```

---

## Task 9: Vercel Blob Upload Helper

**Files:**
- Create: `src/lib/blob/upload.ts`

- [ ] **Step 1: Install Vercel Blob**

```bash
npm install @vercel/blob
```

- [ ] **Step 2: Create upload helper**

```ts
// src/lib/blob/upload.ts
import { put } from '@vercel/blob'

type UploadTarget =
  | { type: 'workspace'; orgId: string }
  | { type: 'user'; userId: string }

export async function uploadAvatar(file: File, target: UploadTarget): Promise<string> {
  const prefix =
    target.type === 'workspace'
      ? `workspaces/${target.orgId}/avatar`
      : `users/${target.userId}/avatar`

  const ext = file.name.split('.').pop() ?? 'jpg'
  const pathname = `${prefix}.${ext}`

  const { url } = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: false,
  })

  return url
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/blob/
git commit -m "feat: add Vercel Blob uploadAvatar helper"
```

---

## Task 10: Clerk Webhook Handler (Profiles Sync)

**Files:**
- Create: `src/app/api/webhooks/clerk/route.ts`
- Create: `src/app/api/webhooks/clerk/__tests__/route.test.ts`

- [ ] **Step 1: Install svix**

```bash
npm install svix
```

- [ ] **Step 2: Write failing test**

```ts
// src/app/api/webhooks/clerk/__tests__/route.test.ts
import { POST } from '../route'
import { NextRequest } from 'next/server'

jest.mock('svix', () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: jest.fn().mockReturnValue({
      type: 'user.created',
      data: {
        id: 'user_123',
        first_name: 'Albert',
        last_name: 'Day',
        email_addresses: [{ email_address: 'albert@test.com', id: 'ea_1' }],
        primary_email_address_id: 'ea_1',
        image_url: null,
      },
    }),
  })),
}))

jest.mock('@/lib/db', () => ({
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}))

jest.mock('@/lib/db/schema', () => ({ profiles: 'profiles_table' }))

describe('POST /api/webhooks/clerk', () => {
  it('returns 400 when svix headers are missing', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/clerk', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 3: Run test to confirm failure**

```bash
npm test -- "src/app/api/webhooks/clerk/__tests__/route.test.ts"
```

Expected: `FAIL` — `Cannot find module '../route'`

- [ ] **Step 4: Implement webhook handler**

```ts
// src/app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'

type ClerkUserPayload = {
  id: string
  first_name: string | null
  last_name: string | null
  email_addresses: { email_address: string; id: string }[]
  primary_email_address_id: string
  image_url: string | null
}

function getDisplayName(data: ClerkUserPayload): string {
  const name = `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim()
  return name || 'Unknown'
}

function getPrimaryEmail(data: ClerkUserPayload): string {
  return (
    data.email_addresses.find((e) => e.id === data.primary_email_address_id)
      ?.email_address ?? ''
  )
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 })
  }

  const body = await req.text()
  let event: { type: string; data: ClerkUserPayload }

  try {
    const wh = new Webhook(webhookSecret)
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as { type: string; data: ClerkUserPayload }
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  if (event.type === 'user.created' || event.type === 'user.updated') {
    const { data } = event
    await db
      .insert(profiles)
      .values({
        clerkUserId: data.id,
        displayName: getDisplayName(data),
        email: getPrimaryEmail(data),
        avatarUrl: data.image_url,
      })
      .onConflictDoUpdate({
        target: profiles.clerkUserId,
        set: {
          displayName: getDisplayName(data),
          email: getPrimaryEmail(data),
          avatarUrl: data.image_url,
          updatedAt: new Date(),
        },
      })
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Step 5: Run test to confirm pass**

```bash
npm test -- "src/app/api/webhooks/clerk/__tests__/route.test.ts"
```

Expected:
```
PASS src/app/api/webhooks/clerk/__tests__/route.test.ts
  POST /api/webhooks/clerk
    ✓ returns 400 when svix headers are missing

Tests: 1 passed, 1 total
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/
git commit -m "feat: add Clerk webhook handler to sync user profiles"
```

---

## Task 11: Workspace Server Action

**Files:**
- Create: `src/modules/workspaces/actions.ts`
- Create: `src/modules/workspaces/queries.ts`
- Create: `src/modules/workspaces/__tests__/actions.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/modules/workspaces/__tests__/actions.test.ts
import { createWorkspace } from '../actions'

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn().mockResolvedValue({ userId: 'user_123' }),
  clerkClient: jest.fn().mockResolvedValue({
    organizations: {
      createOrganization: jest.fn().mockResolvedValue({ id: 'org_abc' }),
    },
  }),
}))

const mockInsert = jest.fn()
jest.mock('@/lib/db', () => ({
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 'ws_uuid_1' }]),
      }),
    }),
  },
}))

jest.mock('@/lib/db/schema', () => ({
  workspaces: 'workspaces_table',
  workspaceMembers: 'workspace_members_table',
}))

describe('createWorkspace', () => {
  it('returns error when not authenticated', async () => {
    const { auth } = require('@clerk/nextjs/server')
    auth.mockResolvedValueOnce({ userId: null })

    const result = await createWorkspace({ name: 'Lady M', type: 'vessel' })
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns success with orgId on valid input', async () => {
    const result = await createWorkspace({ name: 'Lady M', type: 'vessel' })
    expect(result).toEqual({ success: true, orgId: 'org_abc' })
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npm test -- "src/modules/workspaces/__tests__/actions.test.ts"
```

Expected: `FAIL` — `Cannot find module '../actions'`

- [ ] **Step 3: Implement createWorkspace action**

```ts
// src/modules/workspaces/actions.ts
'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { workspaces, workspaceMembers } from '@/lib/db/schema'

type CreateWorkspaceInput = {
  name: string
  type: 'vessel' | 'property'
  avatarUrl?: string
}

type CreateWorkspaceResult = { success: true; orgId: string } | { error: string }

export async function createWorkspace(
  input: CreateWorkspaceInput
): Promise<CreateWorkspaceResult> {
  const { userId } = await auth()
  if (!userId) return { error: 'Not authenticated' }

  const client = await clerkClient()
  const org = await client.organizations.createOrganization({
    name: input.name,
    createdBy: userId,
  })

  const [workspace] = await db
    .insert(workspaces)
    .values({
      clerkOrgId: org.id,
      name: input.name,
      type: input.type,
      avatarUrl: input.avatarUrl ?? null,
    })
    .returning()

  await db.insert(workspaceMembers).values({
    workspaceId: workspace.id,
    clerkUserId: userId,
    role: 'owner',
  })

  return { success: true, orgId: org.id }
}
```

- [ ] **Step 4: Create workspace queries**

```ts
// src/modules/workspaces/queries.ts
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { workspaces } from '@/lib/db/schema'

export async function getWorkspaceByOrgId(clerkOrgId: string) {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.clerkOrgId, clerkOrgId))
    .limit(1)
  return workspace ?? null
}
```

- [ ] **Step 5: Run tests to confirm pass**

```bash
npm test -- "src/modules/workspaces/__tests__/actions.test.ts"
```

Expected:
```
PASS src/modules/workspaces/__tests__/actions.test.ts
  createWorkspace
    ✓ returns error when not authenticated
    ✓ returns success with orgId on valid input

Tests: 2 passed, 2 total
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/workspaces/
git commit -m "feat: add createWorkspace server action and workspace queries"
```

---

## Task 12: App Shell — Sidebar

**Files:**
- Create: `src/components/shell/SidebarNavItem.tsx`
- Create: `src/components/shell/Sidebar.tsx`

- [ ] **Step 1: Create SidebarNavItem**

```tsx
// src/components/shell/SidebarNavItem.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type SidebarNavItemProps = {
  href: string
  label: string
  icon: React.ReactNode
  disabled?: boolean
}

export function SidebarNavItem({ href, label, icon, disabled = false }: SidebarNavItemProps) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(href)

  if (disabled) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-lg text-frame-ink-tertiary opacity-40">
              {icon}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-frame-surface-2 text-frame-ink-muted border-frame-hairline text-xs">
            {label} — coming soon
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              'relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
              isActive
                ? 'bg-frame-surface-3 text-frame-orange before:absolute before:left-[-1px] before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-r before:bg-frame-orange before:content-[""]'
                : 'text-frame-ink-tertiary hover:bg-frame-surface-2 hover:text-frame-ink-subtle'
            )}
          >
            {icon}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-frame-surface-2 text-frame-ink-muted border-frame-hairline text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

- [ ] **Step 2: Create Sidebar**

```tsx
// src/components/shell/Sidebar.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SidebarNavItem } from './SidebarNavItem'

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    enabled: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
  {
    href: '/work-orders',
    label: 'Work Orders',
    enabled: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2" y="2" width="12" height="3" rx="1.5" fill="currentColor" />
        <rect x="2" y="7" width="9" height="3" rx="1.5" fill="currentColor" />
        <rect x="2" y="12" width="6" height="2" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: '/maintenance',
    label: 'Maintenance',
    enabled: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/inventory',
    label: 'Inventory',
    enabled: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="9" width="14" height="6" rx="1.5" fill="currentColor" opacity="0.5" />
        <rect x="3" y="5" width="10" height="5" rx="1" fill="currentColor" />
        <rect x="5" y="2" width="6" height="4" rx="1" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  {
    href: '/certificates',
    label: 'Certificates',
    enabled: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 5h6M5 8h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    href: '/safety',
    label: 'Safety & ISM',
    enabled: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 2L2 5v4c0 3 2.5 4.5 6 5 3.5-.5 6-2 6-5V5L8 2z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: '/documents',
    label: 'Documents',
    enabled: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="3" y="1" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/charter',
    label: 'Charter',
    enabled: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="3" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 3V1.5M11 3V1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
] as const

function FrameLogo() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-frame-orange">
      <div className="h-4 w-4 rounded-sm border-2 border-frame-canvas" />
    </div>
  )
}

function SidebarContent() {
  const { signOut } = useAuth()

  return (
    <div className="flex h-full w-14 flex-col items-center border-r border-frame-hairline bg-[#0d0e0f] py-3">
      <div className="mb-4">
        <FrameLogo />
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            disabled={!item.enabled}
          />
        ))}
      </nav>

      <div className="flex flex-col items-center gap-2 pt-2">
        <SidebarNavItem
          href="/settings"
          label="Settings"
          disabled
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        />
        <button
          onClick={() => signOut()}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-frame-hairline bg-frame-surface-2 text-xs font-semibold text-frame-ink-muted hover:bg-frame-surface-3 transition-colors"
          aria-label="Sign out"
        >
          AD
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile) {
    return (
      <>
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-frame-orange shadow-lg md:hidden"
              aria-label="Open navigation"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 5h14M2 9h14M2 13h14" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-14 p-0 bg-[#0d0e0f] border-r border-frame-hairline">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return <SidebarContent />
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shell/Sidebar.tsx src/components/shell/SidebarNavItem.tsx
git commit -m "feat: add Sidebar with icon nav, active states, and mobile drawer"
```

---

## Task 13: App Shell — Topbar & WorkspaceSwitcher

**Files:**
- Create: `src/components/shell/WorkspaceSwitcher.tsx`
- Create: `src/components/shell/TopbarClient.tsx`
- Create: `src/components/shell/Topbar.tsx`

- [ ] **Step 1: Create WorkspaceSwitcher**

```tsx
// src/components/shell/WorkspaceSwitcher.tsx
'use client'

import { useOrganizationList, useOrganization } from '@clerk/nextjs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function WorkspaceSwitcher() {
  const { organization } = useOrganization()
  const { userMemberships, setActive } = useOrganizationList({
    userMemberships: { infinite: true },
  })

  if (!organization) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md border border-frame-hairline-strong bg-frame-surface-1 px-2.5 py-1.5 transition-colors hover:bg-frame-surface-2">
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-frame-orange" />
          <span className="max-w-[140px] truncate text-xs font-medium text-frame-ink">
            {organization.name}
          </span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0 text-frame-ink-tertiary">
            <path d="M2.5 3.5L5 6.5L7.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52 border-frame-hairline bg-frame-surface-2 text-frame-ink">
        {userMemberships.data?.map((membership) => (
          <DropdownMenuItem
            key={membership.organization.id}
            onClick={() => setActive?.({ organization: membership.organization.id })}
            className={cn(
              'flex cursor-pointer items-center gap-2 hover:bg-frame-surface-3',
              membership.organization.id === organization.id && 'bg-frame-surface-3'
            )}
          >
            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-frame-orange" />
            <span className="truncate text-xs">{membership.organization.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-frame-hairline" />
        <DropdownMenuItem
          className="cursor-pointer text-xs text-frame-ink-subtle hover:bg-frame-surface-3"
          onClick={() => (window.location.href = '/onboarding')}
        >
          + Add workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 2: Create TopbarClient**

```tsx
// src/components/shell/TopbarClient.tsx
'use client'

import { WorkspaceSwitcher } from './WorkspaceSwitcher'

type TopbarClientProps = { breadcrumb: string }

export function TopbarClient({ breadcrumb }: TopbarClientProps) {
  return (
    <div className="flex h-12 flex-shrink-0 items-center gap-3 border-b border-frame-hairline bg-[#0d0e0f] px-4">
      <WorkspaceSwitcher />

      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-frame-ink-tertiary">Frame</span>
        <span className="text-frame-hairline-3">/</span>
        <span className="font-medium text-frame-ink">{breadcrumb}</span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md border border-frame-hairline bg-frame-surface-1 text-frame-ink-tertiary transition-colors hover:bg-frame-surface-2 hover:text-frame-ink-subtle"
          aria-label="Search (coming soon)"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8.5 8.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        {/* Notifications bell — visual only in Phase 1 */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md border border-frame-hairline bg-frame-surface-1 text-frame-ink-tertiary transition-colors hover:bg-frame-surface-2 hover:text-frame-ink-subtle"
          aria-label="Notifications (coming soon)"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5a4 4 0 014 4v2.5l1 1.5H2l1-1.5V5.5a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5.5 11.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create Topbar (server component)**

```tsx
// src/components/shell/Topbar.tsx
import { TopbarClient } from './TopbarClient'

type TopbarProps = { breadcrumb: string }

export function Topbar({ breadcrumb }: TopbarProps) {
  return <TopbarClient breadcrumb={breadcrumb} />
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shell/
git commit -m "feat: add Topbar with WorkspaceSwitcher and breadcrumb"
```

---

## Task 14: Protected App Layout + Placeholder Dashboard

**Files:**
- Create: `src/app/(app)/layout.tsx`
- Create: `src/app/(app)/dashboard/page.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Create protected app layout**

```tsx
// src/app/(app)/layout.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shell/Sidebar'
import { Topbar } from '@/components/shell/Topbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId, orgId } = await auth()

  if (!userId) redirect('/sign-in')
  if (!orgId) redirect('/onboarding')

  return (
    <div className="flex h-screen overflow-hidden bg-frame-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar breadcrumb="Dashboard" />
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create placeholder dashboard page**

```tsx
// src/app/(app)/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const STAT_CARDS = [
  { label: 'Open Work Orders', value: '—', colorClass: 'text-frame-ink' },
  { label: 'Overdue Maintenance', value: '—', colorClass: 'text-frame-red' },
  { label: 'Certs Expiring', value: '—', colorClass: 'text-frame-amber' },
  { label: 'Low Stock Items', value: '—', colorClass: 'text-frame-ink' },
] as const

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-frame-ink">Dashboard</h1>
        <p className="mt-0.5 text-xs text-frame-ink-tertiary">Vessel overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CARDS.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="px-4 pb-1 pt-3">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-frame-ink-tertiary">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <span className={`text-2xl font-semibold ${stat.colorClass}`}>{stat.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-sm text-frame-ink-tertiary">Dashboard content arrives in Phase 2</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Add root redirect**

```tsx
// src/app/page.tsx
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
```

- [ ] **Step 4: Start dev server and verify full shell**

```bash
npm run dev
```

Sign in at http://localhost:3000/sign-in. Expected: dark icon sidebar (56px) on the left, topbar with workspace switcher at top, placeholder dashboard in the content area. All future module icons in sidebar appear dimmed with "coming soon" tooltips on hover. Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(app)/" src/app/page.tsx
git commit -m "feat: add protected app layout with Sidebar and Topbar, placeholder dashboard"
```

---

## Task 15: Onboarding Flow

**Files:**
- Create: `src/app/(auth)/onboarding/page.tsx`
- Create: `src/app/(auth)/onboarding/_components/OnboardingForm.tsx`

- [ ] **Step 1: Create OnboardingForm (client component)**

```tsx
// src/app/(auth)/onboarding/_components/OnboardingForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganizationList } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { createWorkspace } from '@/modules/workspaces/actions'

type Step = 'name' | 'type' | 'photo'
type WorkspaceType = 'vessel' | 'property'

export function OnboardingForm() {
  const router = useRouter()
  const { setActive } = useOrganizationList()
  const [isPending, startTransition] = useTransition()

  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [type, setType] = useState<WorkspaceType>('vessel')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    startTransition(async () => {
      const result = await createWorkspace({ name, type })
      if ('error' in result) {
        setError(result.error)
        return
      }
      await setActive?.({ organization: result.orgId })
      router.push('/dashboard')
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-frame-ink">
          {step === 'name' && 'Name your workspace'}
          {step === 'type' && 'What type of workspace?'}
          {step === 'photo' && 'Add a photo (optional)'}
        </h2>
        <p className="mt-1 text-xs text-frame-ink-subtle">
          {step === 'name' && 'This is usually your vessel or property name.'}
          {step === 'type' && 'This helps Frame show the right modules.'}
          {step === 'photo' && 'A photo helps your crew identify this workspace.'}
        </p>
      </div>

      {step === 'name' && (
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lady M, Villa Azur"
            className="w-full rounded-lg border border-frame-hairline-strong bg-frame-surface-2 px-3 py-2.5 text-sm text-frame-ink placeholder:text-frame-ink-tertiary focus:border-frame-orange focus:outline-none"
            autoFocus
          />
          <Button onClick={() => setStep('type')} disabled={!name.trim()} className="w-full">
            Continue
          </Button>
        </div>
      )}

      {step === 'type' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {(['vessel', 'property'] as WorkspaceType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  type === t
                    ? 'border-frame-orange bg-frame-surface-2 text-frame-ink'
                    : 'border-frame-hairline bg-frame-surface-1 text-frame-ink-subtle hover:border-frame-hairline-strong'
                }`}
              >
                <div className="text-sm font-medium capitalize">{t}</div>
                <div className="mt-0.5 text-xs text-frame-ink-tertiary">
                  {t === 'vessel' ? 'Yacht, motor vessel, sailing boat' : 'Villa, apartment, estate'}
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('name')} className="flex-1">
              Back
            </Button>
            <Button onClick={() => setStep('photo')} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 'photo' && (
        <div className="space-y-3">
          <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-frame-hairline-strong bg-frame-surface-2 text-xs text-frame-ink-tertiary">
            Photo upload — Phase 2
          </div>
          {error && <p className="text-xs text-frame-red">{error}</p>}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep('type')}
              className="flex-1"
              disabled={isPending}
            >
              Back
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isPending}>
              {isPending ? 'Creating…' : 'Create workspace'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create onboarding page (server component)**

```tsx
// src/app/(auth)/onboarding/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { OnboardingForm } from './_components/OnboardingForm'

export default async function OnboardingPage() {
  const { userId, orgId } = await auth()

  if (orgId) redirect('/dashboard')
  if (!userId) redirect('/sign-in')

  return <OnboardingForm />
}
```

- [ ] **Step 3: Verify end-to-end onboarding flow**

```bash
npm run dev
```

Sign up as a new user at http://localhost:3000/sign-up. Verify:
1. Clerk sign-up form (styled) → email verification
2. Redirect to `/onboarding` (middleware catches no-org state)
3. Step 1: Enter workspace name → Continue
4. Step 2: Choose vessel or property → Continue
5. Step 3: Skip photo → Create workspace
6. Redirect to `/dashboard` with new org active in workspace switcher

Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(auth)/onboarding/"
git commit -m "feat: add 3-step onboarding flow to create first workspace"
```

---

## Task 16: Vercel Deploy + Environment Variables

- [ ] **Step 1: Provision Neon Postgres**

In the Vercel dashboard for your project:
1. **Storage** tab → **Connect Store** → **Neon Postgres** → Create new
2. Copy the `DATABASE_URL` value into your `.env.local`

- [ ] **Step 2: Provision Vercel Blob**

In the Vercel dashboard:
1. **Storage** tab → **Connect Store** → **Blob** → Create new
2. Copy `BLOB_READ_WRITE_TOKEN` into your `.env.local`

- [ ] **Step 3: Configure Clerk webhook**

In the Clerk dashboard:
1. **Webhooks** → **Add Endpoint**
2. URL: `https://<your-vercel-domain>/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`
4. Copy the signing secret → set as `CLERK_WEBHOOK_SECRET`

- [ ] **Step 4: Add all env vars to Vercel**

```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production
vercel env add DATABASE_URL production
vercel env add BLOB_READ_WRITE_TOKEN production
vercel env add CLERK_WEBHOOK_SECRET production
```

- [ ] **Step 5: Push schema to production DB**

```bash
npm run db:push
```

Expected: all three tables created in the production Neon database.

- [ ] **Step 6: Deploy**

```bash
vercel --prod
```

Expected: deployment succeeds. Open the production URL. Sign in, complete onboarding, confirm workspace switcher shows the new org, confirm dashboard renders.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: Phase 1 Foundation complete"
```

---

## Self-Review

| Spec requirement | Task |
|-----------------|------|
| Next.js 15, App Router, TypeScript | 1 |
| Tailwind only, Frame tokens in tailwind.config.ts | 2 |
| shadcn/ui installed and themed to Frame | 3 |
| Clerk Organizations auth | 4 |
| Sign-in / sign-up pages (embedded Clerk components) | 5 |
| Neon Postgres + Drizzle | 6 |
| workspaces, workspace_members, profiles tables | 7 |
| isAdmin(), getCurrentRole() helpers + tests | 8 |
| Vercel Blob uploadAvatar() helper | 9 |
| Clerk webhook → profiles sync | 10 |
| createWorkspace server action + tests | 11 |
| Sidebar: icon nav, active state, tooltips, mobile drawer | 12 |
| Topbar + WorkspaceSwitcher dropdown | 13 |
| Protected app layout (SSR auth checks) | 14 |
| Placeholder dashboard page | 14 |
| 3-step onboarding flow | 15 |
| Middleware: protect (app)/, redirect no-org to onboarding | 4 |
| Vercel deploy + all env vars | 16 |

All spec requirements covered. No TBDs. Types defined in Task 7 (`Workspace`, `WorkspaceMember`, `Profile`, `Role`) used consistently across Tasks 8, 10, 11. `ROLES` const defined once in `members.ts`, referenced in `helpers.ts` — no duplication.
