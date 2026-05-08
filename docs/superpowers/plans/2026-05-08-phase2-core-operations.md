# Phase 2: Core Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Work Orders, Planned Maintenance, and a live Dashboard for Frame Marine — all server-rendered with Drizzle + Neon Postgres, mutations via server actions.

**Architecture:** Pages are Next.js 15 Server Components that fetch data and pass it to client leaf components for interactivity. Server actions in `src/modules/` handle all mutations. URL search params preserve filter/selection state across refreshes.

**Tech Stack:** Next.js 15 App Router, TypeScript, Drizzle ORM + Neon Postgres, Clerk v7, Tailwind v4, shadcn/ui + @base-ui/react, lucide-react

**Working directory:** `/Users/albertday/Downloads/frame-marine-app`

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `src/lib/db/schema/work-orders.ts` | Create | workOrders, workOrderSubtasks, workOrderComments tables + enums |
| `src/lib/db/schema/maintenance.ts` | Create | assets, pmsTasks, pmsCompletionLog tables + enum |
| `src/lib/db/schema/index.ts` | Modify | Export new schema files |
| `src/modules/work-orders/types.ts` | Create | WorkOrder, Subtask, Comment TypeScript types |
| `src/modules/work-orders/queries.ts` | Create | DB read queries for work orders |
| `src/modules/work-orders/actions.ts` | Create | Server actions: create, update status, subtasks, comments |
| `src/modules/maintenance/types.ts` | Create | PmsTask, Asset, CompletionLog types + status calculation |
| `src/modules/maintenance/queries.ts` | Create | DB read queries for PMS |
| `src/modules/maintenance/actions.ts` | Create | Server actions: log completion, update hours, create WO from PMS |
| `src/app/(app)/work-orders/page.tsx` | Create | Work Orders page — server component, two-pane layout |
| `src/components/work-orders/WorkOrderStatStrip.tsx` | Create | Live stat counts (server) |
| `src/components/work-orders/WorkOrderList.tsx` | Create | Left pane list of WO rows (server) |
| `src/components/work-orders/WorkOrderDetail.tsx` | Create | Right pane detail panel (client) |
| `src/components/work-orders/WorkOrderSheet.tsx` | Create | New WO slide-over form (client) |
| `src/components/work-orders/WorkOrderFilters.tsx` | Create | Status tabs + priority filter (client) |
| `src/app/(app)/maintenance/page.tsx` | Create | Maintenance page — server component |
| `src/components/maintenance/PmsStatStrip.tsx` | Create | Overdue/due-soon/upcoming counts (server) |
| `src/components/maintenance/PmsTaskList.tsx` | Create | Full-width task list rows (server) |
| `src/components/maintenance/AssetHoursPanel.tsx` | Create | Engine hours inline editor (client) |
| `src/components/maintenance/PmsTaskDetail.tsx` | Create | Task detail slide-over (client) |
| `src/app/(app)/dashboard/page.tsx` | Modify | Wire stat cards to real data + open WOs list |
| `src/components/dashboard/StatCards.tsx` | Create | 4 stat cards (server) |
| `src/components/dashboard/OpenWorkOrdersList.tsx` | Create | Open WOs list (server) |
| `src/components/shell/Sidebar.tsx` | Modify | Enable Work Orders + Maintenance nav items |

---

## Task 1: DB Schema — Work Orders tables

**Files:**
- Create: `src/lib/db/schema/work-orders.ts`

- [ ] **Step 1: Create the work orders schema file**

```typescript
// src/lib/db/schema/work-orders.ts
import { boolean, date, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { profiles } from './profiles'
import { workspaces } from './workspaces'

export const workOrderStatusEnum = pgEnum('work_order_status', [
  'open',
  'in_progress',
  'on_hold',
  'done',
])
export const workOrderPriorityEnum = pgEnum('work_order_priority', ['high', 'medium', 'low'])
export const workOrderTeamEnum = pgEnum('work_order_team', [
  'engineering',
  'deck',
  'interior',
  'charter',
])

export const workOrders = pgTable('work_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  number: text('number').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: workOrderStatusEnum('status').notNull().default('open'),
  priority: workOrderPriorityEnum('priority').notNull().default('medium'),
  team: workOrderTeamEnum('team').notNull(),
  system: text('system'),
  zone: text('zone'),
  assigneeId: text('assignee_id').references(() => profiles.clerkUserId),
  createdById: text('created_by_id')
    .notNull()
    .references(() => profiles.clerkUserId),
  // fromPmsTaskId added without FK to avoid circular import with maintenance.ts
  fromPmsTaskId: uuid('from_pms_task_id'),
  dueDate: date('due_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const workOrderSubtasks = pgTable('work_order_subtasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  workOrderId: uuid('work_order_id')
    .notNull()
    .references(() => workOrders.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  completed: boolean('completed').notNull().default(false),
  order: integer('order').notNull().default(0),
})

export const workOrderComments = pgTable('work_order_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  workOrderId: uuid('work_order_id')
    .notNull()
    .references(() => workOrders.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => profiles.clerkUserId),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type WorkOrder = typeof workOrders.$inferSelect
export type NewWorkOrder = typeof workOrders.$inferInsert
export type WorkOrderSubtask = typeof workOrderSubtasks.$inferSelect
export type WorkOrderComment = typeof workOrderComments.$inferSelect
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 2: DB Schema — Maintenance tables + update index

**Files:**
- Create: `src/lib/db/schema/maintenance.ts`
- Modify: `src/lib/db/schema/index.ts`

- [ ] **Step 1: Create the maintenance schema file**

```typescript
// src/lib/db/schema/maintenance.ts
import { date, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { profiles } from './profiles'
import { workspaces } from './workspaces'
import { workOrders } from './work-orders'

export const pmsIntervalTypeEnum = pgEnum('pms_interval_type', ['hours', 'date'])

export const assets = pgTable('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  zone: text('zone').notNull(),
  system: text('system').notNull(),
  make: text('make'),
  model: text('model'),
  currentHours: integer('current_hours'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const pmsTasks = pgTable('pms_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  assetId: uuid('asset_id').references(() => assets.id),
  system: text('system').notNull(),
  assetName: text('asset_name').notNull(),
  taskName: text('task_name').notNull(),
  intervalType: pmsIntervalTypeEnum('interval_type').notNull(),
  intervalValue: integer('interval_value').notNull(),
  lastCompletedAt: date('last_completed_at'),
  lastCompletedHours: integer('last_completed_hours'),
  nextDueDate: date('next_due_date'),
  nextDueHours: integer('next_due_hours'),
  assigneeId: text('assignee_id').references(() => profiles.clerkUserId),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const pmsCompletionLog = pgTable('pms_completion_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  pmsTaskId: uuid('pms_task_id')
    .notNull()
    .references(() => pmsTasks.id, { onDelete: 'cascade' }),
  completedById: text('completed_by_id')
    .notNull()
    .references(() => profiles.clerkUserId),
  completedAt: date('completed_at').notNull(),
  hoursAtCompletion: integer('hours_at_completion'),
  linkedWorkOrderId: uuid('linked_work_order_id').references(() => workOrders.id),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Asset = typeof assets.$inferSelect
export type PmsTask = typeof pmsTasks.$inferSelect
export type PmsCompletionLog = typeof pmsCompletionLog.$inferSelect
```

- [ ] **Step 2: Update schema index to export new files**

```typescript
// src/lib/db/schema/index.ts
export * from './workspaces'
export * from './members'
export * from './profiles'
export * from './work-orders'
export * from './maintenance'
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Task 3: Generate and push DB migration

**Files:** (no source files — migration only)

- [ ] **Step 1: Generate migration**

Run: `npx drizzle-kit generate`
Expected: creates files in `drizzle/` directory, no errors

- [ ] **Step 2: Push migration to Neon**

Run: `npx drizzle-kit push`
Expected: output shows tables created — `work_orders`, `work_order_subtasks`, `work_order_comments`, `assets`, `pms_tasks`, `pms_completion_log`

- [ ] **Step 3: Commit**

```bash
git add src/lib/db/schema/ drizzle/
git commit -m "feat: add work orders, maintenance, and assets DB schema"
```

---

## Task 4: Work Orders types and queries

**Files:**
- Create: `src/modules/work-orders/types.ts`
- Create: `src/modules/work-orders/queries.ts`

- [ ] **Step 1: Write the test**

```typescript
// src/modules/work-orders/queries.test.ts
import { getWorkOrderStats } from './queries'

describe('getWorkOrderStats', () => {
  it('returns zero counts when no work orders exist', async () => {
    // Uses real DB — workspace with random ID will have no WOs
    const stats = await getWorkOrderStats('00000000-0000-0000-0000-000000000000')
    expect(stats.open).toBe(0)
    expect(stats.inProgress).toBe(0)
    expect(stats.onHold).toBe(0)
    expect(stats.highPriority).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `npx jest src/modules/work-orders/queries.test.ts`
Expected: FAIL — `getWorkOrderStats` not found

- [ ] **Step 3: Create types file**

```typescript
// src/modules/work-orders/types.ts
import type { WorkOrder, WorkOrderComment, WorkOrderSubtask } from '@/lib/db/schema'
import type { Profile } from '@/lib/db/schema'

export type WorkOrderWithRelations = WorkOrder & {
  assignee: Pick<Profile, 'clerkUserId' | 'displayName'> | null
  subtasks: WorkOrderSubtask[]
  comments: (WorkOrderComment & {
    author: Pick<Profile, 'clerkUserId' | 'displayName'>
  })[]
}

export type WorkOrderListItem = WorkOrder & {
  assignee: Pick<Profile, 'clerkUserId' | 'displayName'> | null
}

export type WorkOrderStats = {
  open: number
  inProgress: number
  onHold: number
  highPriority: number
}

export type WorkOrderFilters = {
  status?: string
  priority?: string
}
```

- [ ] **Step 4: Create queries file**

```typescript
// src/modules/work-orders/queries.ts
import { and, asc, count, desc, eq, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { profiles, workOrderComments, workOrders, workOrderSubtasks } from '@/lib/db/schema'
import type { WorkOrderFilters, WorkOrderListItem, WorkOrderStats, WorkOrderWithRelations } from './types'

export async function getWorkOrders(
  workspaceId: string,
  filters?: WorkOrderFilters
): Promise<WorkOrderListItem[]> {
  const conditions = [eq(workOrders.workspaceId, workspaceId)]

  if (filters?.status && filters.status !== 'all') {
    const statusMap: Record<string, 'open' | 'in_progress' | 'on_hold' | 'done'> = {
      open: 'open',
      in_progress: 'in_progress',
      on_hold: 'on_hold',
      done: 'done',
    }
    const mapped = statusMap[filters.status]
    if (mapped) conditions.push(eq(workOrders.status, mapped))
  }

  if (filters?.priority && filters.priority !== 'all') {
    const priorityMap: Record<string, 'high' | 'medium' | 'low'> = {
      high: 'high',
      medium: 'medium',
      low: 'low',
    }
    const mapped = priorityMap[filters.priority]
    if (mapped) conditions.push(eq(workOrders.priority, mapped))
  }

  const rows = await db
    .select({
      wo: workOrders,
      assignee: {
        clerkUserId: profiles.clerkUserId,
        displayName: profiles.displayName,
      },
    })
    .from(workOrders)
    .leftJoin(profiles, eq(workOrders.assigneeId, profiles.clerkUserId))
    .where(and(...conditions))
    .orderBy(
      sql`CASE ${workOrders.priority} WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 END`,
      asc(workOrders.dueDate),
      desc(workOrders.createdAt)
    )

  return rows.map((r) => ({ ...r.wo, assignee: r.assignee ?? null }))
}

export async function getWorkOrder(id: string): Promise<WorkOrderWithRelations | null> {
  const [row] = await db
    .select({
      wo: workOrders,
      assignee: {
        clerkUserId: profiles.clerkUserId,
        displayName: profiles.displayName,
      },
    })
    .from(workOrders)
    .leftJoin(profiles, eq(workOrders.assigneeId, profiles.clerkUserId))
    .where(eq(workOrders.id, id))
    .limit(1)

  if (!row) return null

  const subtasks = await db
    .select()
    .from(workOrderSubtasks)
    .where(eq(workOrderSubtasks.workOrderId, id))
    .orderBy(asc(workOrderSubtasks.order))

  const commentRows = await db
    .select({
      comment: workOrderComments,
      author: {
        clerkUserId: profiles.clerkUserId,
        displayName: profiles.displayName,
      },
    })
    .from(workOrderComments)
    .innerJoin(profiles, eq(workOrderComments.authorId, profiles.clerkUserId))
    .where(eq(workOrderComments.workOrderId, id))
    .orderBy(asc(workOrderComments.createdAt))

  return {
    ...row.wo,
    assignee: row.assignee ?? null,
    subtasks,
    comments: commentRows.map((r) => ({ ...r.comment, author: r.author })),
  }
}

export async function getWorkOrderStats(workspaceId: string): Promise<WorkOrderStats> {
  const [open, inProgress, onHold, highPriority] = await Promise.all([
    db
      .select({ value: count() })
      .from(workOrders)
      .where(and(eq(workOrders.workspaceId, workspaceId), eq(workOrders.status, 'open'))),
    db
      .select({ value: count() })
      .from(workOrders)
      .where(and(eq(workOrders.workspaceId, workspaceId), eq(workOrders.status, 'in_progress'))),
    db
      .select({ value: count() })
      .from(workOrders)
      .where(and(eq(workOrders.workspaceId, workspaceId), eq(workOrders.status, 'on_hold'))),
    db
      .select({ value: count() })
      .from(workOrders)
      .where(
        and(
          eq(workOrders.workspaceId, workspaceId),
          eq(workOrders.priority, 'high'),
          or(eq(workOrders.status, 'open'), eq(workOrders.status, 'in_progress'))
        )
      ),
  ])

  return {
    open: Number(open[0]?.value ?? 0),
    inProgress: Number(inProgress[0]?.value ?? 0),
    onHold: Number(onHold[0]?.value ?? 0),
    highPriority: Number(highPriority[0]?.value ?? 0),
  }
}

export async function getOpenWorkOrders(workspaceId: string, limit = 10): Promise<WorkOrderListItem[]> {
  const rows = await db
    .select({
      wo: workOrders,
      assignee: {
        clerkUserId: profiles.clerkUserId,
        displayName: profiles.displayName,
      },
    })
    .from(workOrders)
    .leftJoin(profiles, eq(workOrders.assigneeId, profiles.clerkUserId))
    .where(
      and(
        eq(workOrders.workspaceId, workspaceId),
        or(eq(workOrders.status, 'open'), eq(workOrders.status, 'in_progress'))
      )
    )
    .orderBy(
      sql`CASE ${workOrders.priority} WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 END`,
      asc(workOrders.dueDate)
    )
    .limit(limit)

  return rows.map((r) => ({ ...r.wo, assignee: r.assignee ?? null }))
}
```

- [ ] **Step 5: Run test**

Run: `npx jest src/modules/work-orders/queries.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/modules/work-orders/
git commit -m "feat: work orders types and queries"
```

---

## Task 5: Work Orders server actions

**Files:**
- Create: `src/modules/work-orders/actions.ts`

- [ ] **Step 1: Write the test**

```typescript
// src/modules/work-orders/actions.test.ts
import { generateWorkOrderNumber } from './actions'

describe('generateWorkOrderNumber', () => {
  it('zero-pads to 3 digits', () => {
    expect(generateWorkOrderNumber(0)).toBe('WO-001')
    expect(generateWorkOrderNumber(9)).toBe('WO-010')
    expect(generateWorkOrderNumber(99)).toBe('WO-100')
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

Run: `npx jest src/modules/work-orders/actions.test.ts`
Expected: FAIL

- [ ] **Step 3: Create actions file**

```typescript
// src/modules/work-orders/actions.ts
'use server'

import { auth } from '@clerk/nextjs/server'
import { and, count, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { workOrderComments, workOrders, workOrderSubtasks } from '@/lib/db/schema'

export function generateWorkOrderNumber(existingCount: number): string {
  return `WO-${String(existingCount + 1).padStart(3, '0')}`
}

type CreateWorkOrderInput = {
  workspaceId: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  team: 'engineering' | 'deck' | 'interior' | 'charter'
  system?: string
  zone?: string
  assigneeId?: string
  dueDate?: string
  fromPmsTaskId?: string
}

export async function createWorkOrder(
  input: CreateWorkOrderInput
): Promise<{ id: string } | { error: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Not authenticated' }

  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(workOrders)
    .where(eq(workOrders.workspaceId, input.workspaceId))

  const number = generateWorkOrderNumber(Number(existingCount))

  const [wo] = await db
    .insert(workOrders)
    .values({
      workspaceId: input.workspaceId,
      number,
      title: input.title,
      description: input.description ?? null,
      status: 'open',
      priority: input.priority,
      team: input.team,
      system: input.system ?? null,
      zone: input.zone ?? null,
      assigneeId: input.assigneeId ?? null,
      createdById: userId,
      fromPmsTaskId: input.fromPmsTaskId ?? null,
      dueDate: input.dueDate ?? null,
    })
    .returning({ id: workOrders.id })

  revalidatePath('/work-orders')
  revalidatePath('/dashboard')
  return { id: wo.id }
}

export async function updateWorkOrderStatus(
  id: string,
  status: 'open' | 'in_progress' | 'on_hold' | 'done'
): Promise<void> {
  const { userId } = await auth()
  if (!userId) return

  await db
    .update(workOrders)
    .set({ status, updatedAt: new Date() })
    .where(eq(workOrders.id, id))

  revalidatePath('/work-orders')
  revalidatePath('/dashboard')
}

export async function updateWorkOrderField(
  id: string,
  field: 'title' | 'description' | 'priority' | 'team' | 'system' | 'zone' | 'assigneeId' | 'dueDate',
  value: string | null
): Promise<void> {
  const { userId } = await auth()
  if (!userId) return

  await db
    .update(workOrders)
    .set({ [field]: value, updatedAt: new Date() })
    .where(eq(workOrders.id, id))

  revalidatePath('/work-orders')
}

export async function toggleSubtask(id: string, completed: boolean): Promise<void> {
  const { userId } = await auth()
  if (!userId) return

  await db
    .update(workOrderSubtasks)
    .set({ completed })
    .where(eq(workOrderSubtasks.id, id))

  revalidatePath('/work-orders')
}

export async function addSubtask(workOrderId: string, text: string): Promise<void> {
  const { userId } = await auth()
  if (!userId) return

  const [{ value: maxOrder }] = await db
    .select({ value: sql<number>`coalesce(max(${workOrderSubtasks.order}), -1)` })
    .from(workOrderSubtasks)
    .where(eq(workOrderSubtasks.workOrderId, workOrderId))

  await db.insert(workOrderSubtasks).values({
    workOrderId,
    text,
    completed: false,
    order: Number(maxOrder) + 1,
  })

  revalidatePath('/work-orders')
}

export async function addComment(workOrderId: string, text: string): Promise<void> {
  const { userId } = await auth()
  if (!userId) return

  await db.insert(workOrderComments).values({
    workOrderId,
    authorId: userId,
    text,
  })

  revalidatePath('/work-orders')
}
```

- [ ] **Step 4: Run test**

Run: `npx jest src/modules/work-orders/actions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/work-orders/actions.ts src/modules/work-orders/actions.test.ts
git commit -m "feat: work orders server actions"
```

---

## Task 6: Work Orders page + list panel

**Files:**
- Create: `src/app/(app)/work-orders/page.tsx`
- Create: `src/components/work-orders/WorkOrderStatStrip.tsx`
- Create: `src/components/work-orders/WorkOrderList.tsx`

- [ ] **Step 1: Create WorkOrderStatStrip (server component)**

```tsx
// src/components/work-orders/WorkOrderStatStrip.tsx
import type { WorkOrderStats } from '@/modules/work-orders/types'

export function WorkOrderStatStrip({ stats }: { stats: WorkOrderStats }) {
  const items = [
    { label: 'Open', value: stats.open },
    { label: 'In Progress', value: stats.inProgress },
    { label: 'On Hold', value: stats.onHold },
    { label: 'High Priority', value: stats.highPriority },
  ]

  return (
    <div className="flex gap-4 border-b border-frame-hairline px-4 py-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="text-[13px] font-light tabular-nums text-frame-ink">{item.value}</span>
          <span className="text-[11px] text-frame-ink-tertiary">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create WorkOrderList (server component)**

```tsx
// src/components/work-orders/WorkOrderList.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { WorkOrderListItem } from '@/modules/work-orders/types'

function PriorityDot({ priority }: { priority: 'high' | 'medium' | 'low' | null }) {
  const color =
    priority === 'high'
      ? 'bg-red-400'
      : priority === 'medium'
      ? 'bg-frame-orange'
      : priority === 'low'
      ? 'bg-amber-400'
      : 'bg-frame-ink-tertiary'
  return <span className={cn('mt-px h-[7px] w-[7px] flex-shrink-0 rounded-full', color)} />
}

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date(new Date().toDateString())
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

type Props = {
  workOrders: WorkOrderListItem[]
  selectedId?: string
  workspaceId: string
  currentParams: URLSearchParams
}

export function WorkOrderList({ workOrders, selectedId, currentParams }: Props) {
  if (workOrders.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <p className="text-[12px] text-frame-ink-tertiary">No work orders</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-px px-2 py-2">
      {workOrders.map((wo) => {
        const params = new URLSearchParams(currentParams)
        params.set('id', wo.id)
        const overdue = isOverdue(wo.dueDate)

        return (
          <Link
            key={wo.id}
            href={`/work-orders?${params.toString()}`}
            className={cn(
              'flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition-colors',
              wo.id === selectedId
                ? 'bg-frame-orange/[.13]'
                : 'hover:bg-frame-surface-2'
            )}
          >
            <PriorityDot priority={wo.priority} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-frame-ink-tertiary">{wo.number}</span>
                <span
                  className={cn(
                    'truncate text-[12.5px] font-medium leading-snug',
                    wo.id === selectedId ? 'text-frame-orange' : 'text-frame-ink'
                  )}
                >
                  {wo.title}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <TeamBadge team={wo.team} />
                {wo.assignee && (
                  <span className="flex h-[16px] w-[16px] flex-shrink-0 items-center justify-center rounded-full bg-frame-orange text-[8px] font-bold text-white">
                    {initials(wo.assignee.displayName)}
                  </span>
                )}
                {wo.dueDate && (
                  <span className={cn('text-[10px]', overdue ? 'text-red-400' : 'text-frame-ink-tertiary')}>
                    {overdue ? 'Overdue' : formatDate(wo.dueDate)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function TeamBadge({ team }: { team: 'engineering' | 'deck' | 'interior' | 'charter' }) {
  const label =
    team === 'engineering' ? 'Eng' : team === 'deck' ? 'Deck' : team === 'interior' ? 'Int' : 'Charter'
  return (
    <span className="rounded bg-frame-surface-2 px-1.5 py-px text-[9px] font-medium text-frame-ink-tertiary">
      {label}
    </span>
  )
}
```

- [ ] **Step 3: Create the Work Orders page**

```tsx
// src/app/(app)/work-orders/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getWorkspaceByOrgId } from '@/modules/workspaces/queries'
import { getWorkOrder, getWorkOrders, getWorkOrderStats } from '@/modules/work-orders/queries'
import { WorkOrderStatStrip } from '@/components/work-orders/WorkOrderStatStrip'
import { WorkOrderList } from '@/components/work-orders/WorkOrderList'
import { WorkOrderDetail } from '@/components/work-orders/WorkOrderDetail'
import { WorkOrderSheet } from '@/components/work-orders/WorkOrderSheet'

type Props = {
  searchParams: Promise<{ id?: string; status?: string; priority?: string }>
}

export default async function WorkOrdersPage({ searchParams }: Props) {
  const { orgId } = await auth()
  if (!orgId) redirect('/onboarding')

  const workspace = await getWorkspaceByOrgId(orgId)
  if (!workspace) redirect('/onboarding')

  const { id, status, priority } = await searchParams

  const [workOrderList, stats, selectedWo] = await Promise.all([
    getWorkOrders(workspace.id, { status, priority }),
    getWorkOrderStats(workspace.id),
    id ? getWorkOrder(id) : Promise.resolve(null),
  ])

  const currentParams = new URLSearchParams()
  if (status) currentParams.set('status', status)
  if (priority) currentParams.set('priority', priority)

  return (
    <div className="-m-5 flex h-[calc(100%+2.5rem)] overflow-hidden">
      {/* Left pane */}
      <div className="flex w-[40%] flex-shrink-0 flex-col border-r border-frame-hairline">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-[15px] font-semibold tracking-[-0.02em] text-frame-ink">Work Orders</h1>
          <WorkOrderSheet workspaceId={workspace.id} />
        </div>
        <WorkOrderStatStrip stats={stats} />
        <div className="flex-1 overflow-y-auto">
          <WorkOrderList
            workOrders={workOrderList}
            selectedId={id}
            workspaceId={workspace.id}
            currentParams={currentParams}
          />
        </div>
      </div>

      {/* Right pane */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <WorkOrderDetail workOrder={selectedWo} workspaceId={workspace.id} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors (WorkOrderDetail and WorkOrderSheet will fail — create stubs next)

- [ ] **Step 5: Create stub files so TypeScript passes**

```tsx
// src/components/work-orders/WorkOrderDetail.tsx
'use client'
import type { WorkOrderWithRelations } from '@/modules/work-orders/types'
export function WorkOrderDetail({ workOrder }: { workOrder: WorkOrderWithRelations | null; workspaceId: string }) {
  if (!workOrder) return <div className="flex flex-1 items-center justify-center"><p className="text-[12px] text-frame-ink-tertiary">Select a work order</p></div>
  return <div className="p-5"><p className="text-frame-ink">{workOrder.title}</p></div>
}
```

```tsx
// src/components/work-orders/WorkOrderSheet.tsx
'use client'
export function WorkOrderSheet({ workspaceId }: { workspaceId: string }) {
  return <button className="rounded-lg bg-frame-orange px-3 py-1.5 text-[12px] font-medium text-white">New Work Order</button>
}
```

- [ ] **Step 6: Verify TypeScript passes**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add src/app/(app)/work-orders/ src/components/work-orders/
git commit -m "feat: work orders page with list panel and stat strip"
```

---

## Task 7: WorkOrderDetail client component

**Files:**
- Modify: `src/components/work-orders/WorkOrderDetail.tsx` (replace stub)

- [ ] **Step 1: Replace stub with full implementation**

```tsx
// src/components/work-orders/WorkOrderDetail.tsx
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  addComment,
  addSubtask,
  toggleSubtask,
  updateWorkOrderStatus,
} from '@/modules/work-orders/actions'
import type { WorkOrderWithRelations } from '@/modules/work-orders/types'

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'done', label: 'Done' },
] as const

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDateTime(ts: Date | string) {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

type Props = {
  workOrder: WorkOrderWithRelations | null
  workspaceId: string
}

export function WorkOrderDetail({ workOrder }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!workOrder) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[12px] text-frame-ink-tertiary">Select a work order</p>
      </div>
    )
  }

  const completedCount = workOrder.subtasks.filter((s) => s.completed).length
  const totalCount = workOrder.subtasks.length

  function handleStatusChange(status: typeof STATUS_OPTIONS[number]['value']) {
    startTransition(async () => {
      await updateWorkOrderStatus(workOrder!.id, status)
    })
  }

  function handleToggleSubtask(subtaskId: string, completed: boolean) {
    startTransition(async () => {
      await toggleSubtask(subtaskId, completed)
    })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-frame-hairline px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] text-frame-ink-tertiary">{workOrder.number}</p>
            <h2 className="mt-0.5 text-[15px] font-semibold leading-tight tracking-[-0.02em] text-frame-ink">
              {workOrder.title}
            </h2>
          </div>
        </div>
        {/* Status selector */}
        <div className="mt-3 flex gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              disabled={isPending}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
                workOrder.status === opt.value
                  ? 'bg-frame-orange/[.15] text-frame-orange'
                  : 'bg-frame-surface-2 text-frame-ink-tertiary hover:text-frame-ink-subtle'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12px]">
          {[
            { label: 'System', value: workOrder.system },
            { label: 'Zone', value: workOrder.zone },
            { label: 'Team', value: workOrder.team ? workOrder.team.charAt(0).toUpperCase() + workOrder.team.slice(1) : null },
            { label: 'Assignee', value: workOrder.assignee?.displayName },
            { label: 'Due', value: workOrder.dueDate ?? null },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-frame-ink-tertiary">{label}</p>
              <p className="mt-0.5 text-frame-ink-subtle">{value ?? '—'}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {workOrder.description && (
          <div>
            <p className="mb-1.5 text-[10px] text-frame-ink-tertiary">Description</p>
            <p className="text-[12.5px] leading-relaxed text-frame-ink-subtle">{workOrder.description}</p>
          </div>
        )}

        {/* Subtasks */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] text-frame-ink-tertiary">Subtasks</p>
            {totalCount > 0 && (
              <p className="text-[10px] text-frame-ink-tertiary">{completedCount}/{totalCount}</p>
            )}
          </div>
          {totalCount > 0 && (
            <div className="mb-2 h-1 overflow-hidden rounded-full bg-frame-surface-2">
              <div
                className="h-full rounded-full bg-frame-orange transition-all"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          )}
          <div className="space-y-1.5">
            {workOrder.subtasks.map((subtask) => (
              <button
                key={subtask.id}
                onClick={() => handleToggleSubtask(subtask.id, !subtask.completed)}
                className="flex w-full items-center gap-2.5 text-left"
              >
                <span
                  className={cn(
                    'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border text-[9px]',
                    subtask.completed
                      ? 'border-frame-orange bg-frame-orange text-white'
                      : 'border-frame-hairline bg-transparent text-transparent'
                  )}
                >
                  ✓
                </span>
                <span
                  className={cn(
                    'text-[12px]',
                    subtask.completed ? 'text-frame-ink-tertiary line-through' : 'text-frame-ink-subtle'
                  )}
                >
                  {subtask.text}
                </span>
              </button>
            ))}
          </div>
          <AddSubtaskInline workOrderId={workOrder.id} />
        </div>

        {/* Comments */}
        <div>
          <p className="mb-2.5 text-[10px] text-frame-ink-tertiary">Comments</p>
          <div className="space-y-3">
            {workOrder.comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-frame-orange text-[8px] font-bold text-white">
                  {initials(comment.author.displayName)}
                </span>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-medium text-frame-ink">{comment.author.displayName}</span>
                    <span className="text-[10px] text-frame-ink-tertiary">{formatDateTime(comment.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-frame-ink-subtle">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
          <AddCommentForm workOrderId={workOrder.id} />
        </div>
      </div>
    </div>
  )
}

function AddSubtaskInline({ workOrderId }: { workOrderId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const text = new FormData(form).get('text') as string
    if (!text.trim()) return
    startTransition(async () => {
      await addSubtask(workOrderId, text.trim())
      form.reset()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <input
        name="text"
        placeholder="Add subtask…"
        disabled={isPending}
        className="flex-1 rounded-md border border-frame-hairline bg-frame-surface-1 px-2.5 py-1.5 text-[12px] text-frame-ink placeholder:text-frame-ink-tertiary focus:outline-none focus:ring-1 focus:ring-frame-orange"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-frame-surface-2 px-2.5 py-1.5 text-[11px] font-medium text-frame-ink-subtle hover:text-frame-ink"
      >
        Add
      </button>
    </form>
  )
}

function AddCommentForm({ workOrderId }: { workOrderId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const text = new FormData(form).get('text') as string
    if (!text.trim()) return
    startTransition(async () => {
      await addComment(workOrderId, text.trim())
      form.reset()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        name="text"
        rows={2}
        placeholder="Add a comment…"
        disabled={isPending}
        className="w-full resize-none rounded-md border border-frame-hairline bg-frame-surface-1 px-2.5 py-2 text-[12px] text-frame-ink placeholder:text-frame-ink-tertiary focus:outline-none focus:ring-1 focus:ring-frame-orange"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-frame-orange px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-50"
      >
        Comment
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/work-orders/WorkOrderDetail.tsx
git commit -m "feat: work order detail panel with status, subtasks, comments"
```

---

## Task 8: WorkOrderSheet (new WO slide-over)

**Files:**
- Modify: `src/components/work-orders/WorkOrderSheet.tsx` (replace stub)

- [ ] **Step 1: Check how shadcn Sheet works in this project**

Run: `ls src/components/ui/`
Look for `sheet.tsx` or `dialog.tsx`. If missing:
Run: `npx shadcn@latest add sheet`

- [ ] **Step 2: Replace stub with full slide-over**

```tsx
// src/components/work-orders/WorkOrderSheet.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { Plus } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { createWorkOrder } from '@/modules/work-orders/actions'

type Props = {
  workspaceId: string
}

export function WorkOrderSheet({ workspaceId }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createWorkOrder({
        workspaceId,
        title: data.get('title') as string,
        description: (data.get('description') as string) || undefined,
        priority: (data.get('priority') as 'high' | 'medium' | 'low') ?? 'medium',
        team: (data.get('team') as 'engineering' | 'deck' | 'interior' | 'charter'),
        system: (data.get('system') as string) || undefined,
        zone: (data.get('zone') as string) || undefined,
        dueDate: (data.get('dueDate') as string) || undefined,
      })

      if ('id' in result) {
        setOpen(false)
        router.push(`/work-orders?id=${result.id}`)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-lg bg-frame-orange px-3 py-1.5 text-[12px] font-medium text-white hover:bg-frame-orange/90">
          <Plus size={13} />
          New Work Order
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[380px] border-frame-hairline bg-frame-surface-1 p-0">
        <SheetHeader className="border-b border-frame-hairline px-5 py-4">
          <SheetTitle className="text-[14px] font-semibold text-frame-ink">New Work Order</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-4">
          <Field label="Title" required>
            <input
              name="title"
              required
              placeholder="Describe the work…"
              className="input-base"
            />
          </Field>
          <Field label="Description">
            <textarea name="description" rows={3} placeholder="Details…" className="input-base resize-none" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority">
              <select name="priority" defaultValue="medium" className="input-base">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </Field>
            <Field label="Team" required>
              <select name="team" required className="input-base">
                <option value="">Select…</option>
                <option value="engineering">Engineering</option>
                <option value="deck">Deck</option>
                <option value="interior">Interior</option>
                <option value="charter">Charter</option>
              </select>
            </Field>
            <Field label="System">
              <input name="system" placeholder="e.g. Propulsion" className="input-base" />
            </Field>
            <Field label="Zone">
              <input name="zone" placeholder="e.g. Engine Room" className="input-base" />
            </Field>
            <Field label="Due Date">
              <input name="dueDate" type="date" className="input-base" />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-frame-surface-2 px-3 py-2 text-[12px] font-medium text-frame-ink-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-frame-orange px-4 py-2 text-[12px] font-medium text-white disabled:opacity-50"
            >
              {isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium text-frame-ink-tertiary">
        {label}{required && <span className="ml-0.5 text-frame-orange">*</span>}
      </label>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Add `input-base` utility to globals.css**

Open `src/app/globals.css` and add after the existing `@layer` blocks:

```css
@layer components {
  .input-base {
    @apply w-full rounded-lg border border-frame-hairline bg-frame-surface-2 px-2.5 py-2 text-[12px] text-frame-ink placeholder:text-frame-ink-tertiary focus:outline-none focus:ring-1 focus:ring-frame-orange;
  }
}
```

- [ ] **Step 4: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/components/work-orders/WorkOrderSheet.tsx src/app/globals.css
git commit -m "feat: work order new WO slide-over sheet"
```

---

## Task 9: Maintenance types, queries, and actions

**Files:**
- Create: `src/modules/maintenance/types.ts`
- Create: `src/modules/maintenance/queries.ts`
- Create: `src/modules/maintenance/actions.ts`

- [ ] **Step 1: Write the test for status calculation**

```typescript
// src/modules/maintenance/types.test.ts
import { calcPmsStatus } from './types'

describe('calcPmsStatus', () => {
  it('returns overdue when current hours exceed next due hours', () => {
    expect(calcPmsStatus({ intervalType: 'hours', nextDueHours: 3000, intervalValue: 250 }, 3050)).toBe('overdue')
  })

  it('returns due_soon when within 10% of interval remaining (hours)', () => {
    // 250hr interval, due at 3000, current 2975 → 25hrs remaining = 10% of 250
    expect(calcPmsStatus({ intervalType: 'hours', nextDueHours: 3000, intervalValue: 250 }, 2975)).toBe('due_soon')
  })

  it('returns upcoming when plenty of hours remain', () => {
    expect(calcPmsStatus({ intervalType: 'hours', nextDueHours: 3000, intervalValue: 250 }, 2700)).toBe('upcoming')
  })

  it('returns overdue when past due date', () => {
    expect(calcPmsStatus({ intervalType: 'date', nextDueDate: '2020-01-01', intervalValue: 6 })).toBe('overdue')
  })

  it('returns due_soon when due within 30 days', () => {
    const soon = new Date()
    soon.setDate(soon.getDate() + 15)
    const dateStr = soon.toISOString().split('T')[0]
    expect(calcPmsStatus({ intervalType: 'date', nextDueDate: dateStr, intervalValue: 6 })).toBe('due_soon')
  })

  it('returns upcoming when date is far out', () => {
    expect(calcPmsStatus({ intervalType: 'date', nextDueDate: '2099-01-01', intervalValue: 12 })).toBe('upcoming')
  })
})
```

- [ ] **Step 2: Run test to confirm failure**

Run: `npx jest src/modules/maintenance/types.test.ts`
Expected: FAIL

- [ ] **Step 3: Create types file with status calculation**

```typescript
// src/modules/maintenance/types.ts
import type { Asset, PmsCompletionLog, PmsTask } from '@/lib/db/schema'
import type { Profile } from '@/lib/db/schema'

export type PmsStatus = 'overdue' | 'due_soon' | 'upcoming'

type StatusInput = {
  intervalType: 'hours' | 'date'
  nextDueHours?: number | null
  nextDueDate?: string | null
  intervalValue: number
}

export function calcPmsStatus(task: StatusInput, currentHours?: number): PmsStatus {
  if (task.intervalType === 'hours') {
    const hours = currentHours ?? 0
    if (task.nextDueHours == null) return 'upcoming'
    if (hours >= task.nextDueHours) return 'overdue'
    const remaining = task.nextDueHours - hours
    if (remaining <= task.intervalValue * 0.1) return 'due_soon'
    return 'upcoming'
  }

  if (!task.nextDueDate) return 'upcoming'
  const today = new Date()
  const dueDate = new Date(task.nextDueDate)
  if (today > dueDate) return 'overdue'
  const daysRemaining = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (daysRemaining <= 30) return 'due_soon'
  return 'upcoming'
}

export type PmsTaskWithStatus = PmsTask & {
  asset: Asset | null
  status: PmsStatus
}

export type PmsTaskWithHistory = PmsTaskWithStatus & {
  completionHistory: (PmsCompletionLog & {
    completedBy: Pick<Profile, 'clerkUserId' | 'displayName'>
  })[]
}

export type PmsStats = {
  overdue: number
  dueSoon: number
  upcoming: number
}
```

- [ ] **Step 4: Run test**

Run: `npx jest src/modules/maintenance/types.test.ts`
Expected: PASS

- [ ] **Step 5: Create queries file**

```typescript
// src/modules/maintenance/queries.ts
import { and, asc, count, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { assets, pmsCompletionLog, pmsTasks, profiles } from '@/lib/db/schema'
import { calcPmsStatus } from './types'
import type { PmsStats, PmsTaskWithHistory, PmsTaskWithStatus } from './types'

export async function getAssets(workspaceId: string) {
  return db.select().from(assets).where(eq(assets.workspaceId, workspaceId)).orderBy(asc(assets.name))
}

export async function getPmsTasks(
  workspaceId: string,
  filters?: { status?: string; system?: string }
): Promise<PmsTaskWithStatus[]> {
  const conditions = [eq(pmsTasks.workspaceId, workspaceId)]
  if (filters?.system && filters.system !== 'all') {
    conditions.push(eq(pmsTasks.system, filters.system))
  }

  const rows = await db
    .select({ task: pmsTasks, asset: assets })
    .from(pmsTasks)
    .leftJoin(assets, eq(pmsTasks.assetId, assets.id))
    .where(and(...conditions))
    .orderBy(asc(pmsTasks.system), asc(pmsTasks.taskName))

  const result: PmsTaskWithStatus[] = rows.map((r) => ({
    ...r.task,
    asset: r.asset ?? null,
    status: calcPmsStatus(r.task, r.asset?.currentHours ?? undefined),
  }))

  if (filters?.status && filters.status !== 'all') {
    return result.filter((t) => t.status === filters!.status)
  }

  return result.sort((a, b) => {
    const order = { overdue: 0, due_soon: 1, upcoming: 2 }
    return order[a.status] - order[b.status]
  })
}

export async function getPmsTask(id: string): Promise<PmsTaskWithHistory | null> {
  const [row] = await db
    .select({ task: pmsTasks, asset: assets })
    .from(pmsTasks)
    .leftJoin(assets, eq(pmsTasks.assetId, assets.id))
    .where(eq(pmsTasks.id, id))
    .limit(1)

  if (!row) return null

  const historyRows = await db
    .select({ log: pmsCompletionLog, completedBy: { clerkUserId: profiles.clerkUserId, displayName: profiles.displayName } })
    .from(pmsCompletionLog)
    .innerJoin(profiles, eq(pmsCompletionLog.completedById, profiles.clerkUserId))
    .where(eq(pmsCompletionLog.pmsTaskId, id))
    .orderBy(asc(pmsCompletionLog.completedAt))
    .limit(5)

  return {
    ...row.task,
    asset: row.asset ?? null,
    status: calcPmsStatus(row.task, row.asset?.currentHours ?? undefined),
    completionHistory: historyRows.map((r) => ({ ...r.log, completedBy: r.completedBy })),
  }
}

export async function getPmsStats(workspaceId: string): Promise<PmsStats> {
  const tasks = await getPmsTasks(workspaceId)
  return {
    overdue: tasks.filter((t) => t.status === 'overdue').length,
    dueSoon: tasks.filter((t) => t.status === 'due_soon').length,
    upcoming: tasks.filter((t) => t.status === 'upcoming').length,
  }
}
```

- [ ] **Step 6: Create actions file**

```typescript
// src/modules/maintenance/actions.ts
'use server'

import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { assets, pmsCompletionLog, pmsTasks } from '@/lib/db/schema'
import { createWorkOrder } from '@/modules/work-orders/actions'

export async function updateAssetHours(assetId: string, hours: number): Promise<void> {
  const { userId } = await auth()
  if (!userId) return

  await db.update(assets).set({ currentHours: hours }).where(eq(assets.id, assetId))
  revalidatePath('/maintenance')
  revalidatePath('/dashboard')
}

type LogCompletionInput = {
  pmsTaskId: string
  completedAt: string
  hoursAtCompletion?: number
  notes?: string
  workspaceId: string
}

export async function logPmsCompletion(input: LogCompletionInput): Promise<void> {
  const { userId } = await auth()
  if (!userId) return

  const [task] = await db.select().from(pmsTasks).where(eq(pmsTasks.id, input.pmsTaskId)).limit(1)
  if (!task) return

  await db.insert(pmsCompletionLog).values({
    pmsTaskId: input.pmsTaskId,
    completedById: userId,
    completedAt: input.completedAt,
    hoursAtCompletion: input.hoursAtCompletion ?? null,
    notes: input.notes ?? null,
  })

  // Recalculate next due
  let nextDueDate: string | null = null
  let nextDueHours: number | null = null

  if (task.intervalType === 'date') {
    const completed = new Date(input.completedAt)
    completed.setMonth(completed.getMonth() + task.intervalValue)
    nextDueDate = completed.toISOString().split('T')[0]
  } else if (task.intervalType === 'hours' && input.hoursAtCompletion != null) {
    nextDueHours = input.hoursAtCompletion + task.intervalValue
  }

  await db
    .update(pmsTasks)
    .set({
      lastCompletedAt: input.completedAt,
      lastCompletedHours: input.hoursAtCompletion ?? null,
      nextDueDate,
      nextDueHours,
    })
    .where(eq(pmsTasks.id, input.pmsTaskId))

  revalidatePath('/maintenance')
  revalidatePath('/dashboard')
}

export async function createWorkOrderFromPms(
  taskId: string,
  workspaceId: string
): Promise<{ id: string } | { error: string }> {
  const [task] = await db.select().from(pmsTasks).where(eq(pmsTasks.id, taskId)).limit(1)
  if (!task) return { error: 'Task not found' }

  return createWorkOrder({
    workspaceId,
    title: task.taskName,
    system: task.system,
    team: 'engineering',
    priority: 'medium',
    fromPmsTaskId: taskId,
    assigneeId: task.assigneeId ?? undefined,
  })
}
```

- [ ] **Step 7: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add src/modules/maintenance/
git commit -m "feat: maintenance module types, queries, actions"
```

---

## Task 10: Maintenance page + task list

**Files:**
- Create: `src/app/(app)/maintenance/page.tsx`
- Create: `src/components/maintenance/PmsStatStrip.tsx`
- Create: `src/components/maintenance/PmsTaskList.tsx`
- Create: `src/components/maintenance/AssetHoursPanel.tsx` (stub)
- Create: `src/components/maintenance/PmsTaskDetail.tsx` (stub)

- [ ] **Step 1: Create PmsStatStrip**

```tsx
// src/components/maintenance/PmsStatStrip.tsx
import type { PmsStats } from '@/modules/maintenance/types'

export function PmsStatStrip({ stats }: { stats: PmsStats }) {
  const items = [
    { label: 'Overdue', value: stats.overdue, color: 'text-red-400' },
    { label: 'Due Soon', value: stats.dueSoon, color: 'text-amber-400' },
    { label: 'Upcoming', value: stats.upcoming, color: 'text-frame-ink' },
  ]
  return (
    <div className="flex gap-4 border-b border-frame-hairline px-4 py-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`text-[13px] font-light tabular-nums ${item.color}`}>{item.value}</span>
          <span className="text-[11px] text-frame-ink-tertiary">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create PmsTaskList**

```tsx
// src/components/maintenance/PmsTaskList.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { PmsTaskWithStatus } from '@/modules/maintenance/types'

function StatusDot({ status }: { status: 'overdue' | 'due_soon' | 'upcoming' }) {
  const color = status === 'overdue' ? 'bg-red-400' : status === 'due_soon' ? 'bg-amber-400' : 'bg-emerald-400'
  return <span className={cn('mt-0.5 h-[7px] w-[7px] flex-shrink-0 rounded-full', color)} />
}

function StatusPill({ status }: { status: 'overdue' | 'due_soon' | 'upcoming' }) {
  const styles = {
    overdue: 'bg-red-400/10 text-red-400',
    due_soon: 'bg-amber-400/10 text-amber-400',
    upcoming: 'bg-emerald-400/10 text-emerald-400',
  }
  const labels = { overdue: 'Overdue', due_soon: 'Due Soon', upcoming: 'Upcoming' }
  return (
    <span className={cn('rounded px-2 py-0.5 text-[10px] font-medium', styles[status])}>
      {labels[status]}
    </span>
  )
}

function ProgressBar({ task }: { task: PmsTaskWithStatus }) {
  let pct = 0
  if (task.intervalType === 'hours' && task.nextDueHours && task.asset?.currentHours != null) {
    const start = task.nextDueHours - task.intervalValue
    pct = ((task.asset.currentHours - start) / task.intervalValue) * 100
  } else if (task.intervalType === 'date' && task.nextDueDate && task.lastCompletedAt) {
    const start = new Date(task.lastCompletedAt).getTime()
    const end = new Date(task.nextDueDate).getTime()
    const now = Date.now()
    pct = ((now - start) / (end - start)) * 100
  }
  pct = Math.min(pct, 110)
  const color = pct >= 100 ? 'bg-red-400' : pct >= 85 ? 'bg-amber-400' : 'bg-emerald-400'
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-frame-surface-2">
      <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  )
}

type Props = {
  tasks: PmsTaskWithStatus[]
  selectedId?: string
  currentParams: URLSearchParams
}

export function PmsTaskList({ tasks, selectedId, currentParams }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[12px] text-frame-ink-tertiary">No maintenance tasks</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-frame-hairline">
      {tasks.map((task) => {
        const params = new URLSearchParams(currentParams)
        params.set('taskId', task.id)
        const intervalLabel =
          task.intervalType === 'hours'
            ? `Every ${task.intervalValue} hrs`
            : `Every ${task.intervalValue} months`
        const nextDueLabel =
          task.intervalType === 'hours'
            ? task.nextDueHours != null
              ? `${task.nextDueHours.toLocaleString()} hrs`
              : '—'
            : task.nextDueDate ?? '—'

        return (
          <Link
            key={task.id}
            href={`/maintenance?${params.toString()}`}
            className={cn(
              'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-frame-surface-2',
              task.id === selectedId && 'bg-frame-surface-2'
            )}
          >
            <StatusDot status={task.status} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-[12.5px] font-medium text-frame-ink">{task.taskName}</span>
                <StatusPill status={task.status} />
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-[11px] text-frame-ink-tertiary">
                <span className="truncate">{task.assetName}</span>
                <span className="flex-shrink-0">{intervalLabel}</span>
                <span className="flex-shrink-0">Due: {nextDueLabel}</span>
              </div>
              <div className="mt-1.5">
                <ProgressBar task={task} />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Create stub AssetHoursPanel and PmsTaskDetail**

```tsx
// src/components/maintenance/AssetHoursPanel.tsx
'use client'
import type { Asset } from '@/lib/db/schema'
export function AssetHoursPanel({ assets }: { assets: Asset[] }) {
  return <div className="border-b border-frame-hairline px-4 py-3 text-[12px] text-frame-ink-tertiary">{assets.length} assets tracked</div>
}
```

```tsx
// src/components/maintenance/PmsTaskDetail.tsx
'use client'
import type { PmsTaskWithHistory } from '@/modules/maintenance/types'
export function PmsTaskDetail({ task, workspaceId }: { task: PmsTaskWithHistory | null; workspaceId: string }) {
  if (!task) return null
  return <div className="p-4 text-[12px] text-frame-ink">{task.taskName}</div>
}
```

- [ ] **Step 4: Create Maintenance page**

```tsx
// src/app/(app)/maintenance/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getWorkspaceByOrgId } from '@/modules/workspaces/queries'
import { getAssets, getPmsStats, getPmsTasks, getPmsTask } from '@/modules/maintenance/queries'
import { PmsStatStrip } from '@/components/maintenance/PmsStatStrip'
import { PmsTaskList } from '@/components/maintenance/PmsTaskList'
import { AssetHoursPanel } from '@/components/maintenance/AssetHoursPanel'
import { PmsTaskDetail } from '@/components/maintenance/PmsTaskDetail'

type Props = {
  searchParams: Promise<{ taskId?: string; status?: string; system?: string }>
}

export default async function MaintenancePage({ searchParams }: Props) {
  const { orgId } = await auth()
  if (!orgId) redirect('/onboarding')

  const workspace = await getWorkspaceByOrgId(orgId)
  if (!workspace) redirect('/onboarding')

  const { taskId, status, system } = await searchParams

  const [taskList, stats, assetList, selectedTask] = await Promise.all([
    getPmsTasks(workspace.id, { status, system }),
    getPmsStats(workspace.id),
    getAssets(workspace.id),
    taskId ? getPmsTask(taskId) : Promise.resolve(null),
  ])

  const currentParams = new URLSearchParams()
  if (status) currentParams.set('status', status)
  if (system) currentParams.set('system', system)

  return (
    <div className="space-y-0 -m-5">
      <div className="border-b border-frame-hairline px-4 py-3">
        <h1 className="text-[15px] font-semibold tracking-[-0.02em] text-frame-ink">Maintenance</h1>
      </div>
      <AssetHoursPanel assets={assetList} />
      <PmsStatStrip stats={stats} />
      <PmsTaskList tasks={taskList} selectedId={taskId} currentParams={currentParams} />
      {selectedTask && <PmsTaskDetail task={selectedTask} workspaceId={workspace.id} />}
    </div>
  )
}
```

- [ ] **Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/app/(app)/maintenance/ src/components/maintenance/
git commit -m "feat: maintenance page with PMS task list, stat strip, and stubs"
```

---

## Task 11: AssetHoursPanel (full implementation)

**Files:**
- Modify: `src/components/maintenance/AssetHoursPanel.tsx` (replace stub)

- [ ] **Step 1: Replace stub with full implementation**

```tsx
// src/components/maintenance/AssetHoursPanel.tsx
'use client'

import { useTransition, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { updateAssetHours } from '@/modules/maintenance/actions'
import type { Asset } from '@/lib/db/schema'

export function AssetHoursPanel({ assets }: { assets: Asset[] }) {
  const [collapsed, setCollapsed] = useState(false)

  const hourAssets = assets.filter((a) => a.currentHours != null)
  if (hourAssets.length === 0) return null

  return (
    <div className="border-b border-frame-hairline">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-frame-surface-2"
      >
        {collapsed ? <ChevronRight size={13} className="text-frame-ink-tertiary" /> : <ChevronDown size={13} className="text-frame-ink-tertiary" />}
        <span className="text-[11px] font-medium text-frame-ink-tertiary">Engine Hours</span>
      </button>
      {!collapsed && (
        <div className="flex flex-wrap gap-3 px-4 pb-3">
          {hourAssets.map((asset) => (
            <AssetHoursField key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  )
}

function AssetHoursField({ asset }: { asset: Asset }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(asset.currentHours ?? 0))
  const [isPending, startTransition] = useTransition()

  function handleBlur() {
    const hours = parseInt(value, 10)
    if (!isNaN(hours) && hours !== asset.currentHours) {
      startTransition(async () => {
        await updateAssetHours(asset.id, hours)
      })
    }
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-frame-hairline bg-frame-surface-1 px-3 py-2">
      <span className="text-[11px] text-frame-ink-subtle">{asset.name}</span>
      {editing ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
          className="w-20 rounded border border-frame-orange bg-frame-surface-2 px-1.5 py-0.5 text-[12px] text-frame-ink focus:outline-none"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          disabled={isPending}
          className="rounded px-1.5 py-0.5 text-[12px] font-medium text-frame-ink tabular-nums hover:bg-frame-surface-2"
        >
          {parseInt(value).toLocaleString()} hrs
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/maintenance/AssetHoursPanel.tsx
git commit -m "feat: asset hours panel with inline editing"
```

---

## Task 12: PmsTaskDetail slide-over (full implementation)

**Files:**
- Modify: `src/components/maintenance/PmsTaskDetail.tsx` (replace stub)

- [ ] **Step 1: Check if Sheet component exists**

Run: `ls src/components/ui/ | grep sheet`
If missing: `npx shadcn@latest add sheet`

- [ ] **Step 2: Replace stub with full implementation**

```tsx
// src/components/maintenance/PmsTaskDetail.tsx
'use client'

import { useTransition, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { logPmsCompletion, createWorkOrderFromPms } from '@/modules/maintenance/actions'
import type { PmsTaskWithHistory } from '@/modules/maintenance/types'

type Props = {
  task: PmsTaskWithHistory | null
  workspaceId: string
}

export function PmsTaskDetail({ task, workspaceId }: Props) {
  const router = useRouter()
  const open = task != null

  function handleClose() {
    router.back()
  }

  if (!task) return null

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent side="right" className="w-[400px] border-frame-hairline bg-frame-surface-1 p-0 overflow-y-auto">
        <SheetHeader className="border-b border-frame-hairline px-5 py-4">
          <SheetTitle className="text-[14px] font-semibold text-frame-ink">{task.taskName}</SheetTitle>
          <p className="text-[11px] text-frame-ink-tertiary">{task.assetName} · {task.system}</p>
        </SheetHeader>

        <div className="space-y-5 px-5 py-4">
          {/* Interval info */}
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div>
              <p className="text-[10px] text-frame-ink-tertiary">Interval</p>
              <p className="mt-0.5 text-frame-ink-subtle">
                {task.intervalType === 'hours'
                  ? `Every ${task.intervalValue} hrs`
                  : `Every ${task.intervalValue} months`}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-frame-ink-tertiary">Last Completed</p>
              <p className="mt-0.5 text-frame-ink-subtle">{task.lastCompletedAt ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-frame-ink-tertiary">Next Due</p>
              <p className="mt-0.5 text-frame-ink-subtle">
                {task.intervalType === 'hours'
                  ? task.nextDueHours != null ? `${task.nextDueHours.toLocaleString()} hrs` : '—'
                  : task.nextDueDate ?? '—'}
              </p>
            </div>
          </div>

          {/* Completion history */}
          {task.completionHistory.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] text-frame-ink-tertiary">Recent Completions</p>
              <div className="space-y-1.5">
                {task.completionHistory.map((log) => (
                  <div key={log.id} className="flex items-center justify-between rounded-lg bg-frame-surface-2 px-3 py-2 text-[11px]">
                    <span className="text-frame-ink-subtle">{log.completedAt}</span>
                    {log.hoursAtCompletion != null && (
                      <span className="text-frame-ink-tertiary">{log.hoursAtCompletion.toLocaleString()} hrs</span>
                    )}
                    <span className="text-frame-ink-tertiary">{log.completedBy.displayName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Log Completion */}
          <LogCompletionForm
            taskId={task.id}
            workspaceId={workspaceId}
            isHoursBased={task.intervalType === 'hours'}
            currentAssetHours={task.asset?.currentHours ?? undefined}
          />

          {/* Create Work Order */}
          <CreateWOButton taskId={task.id} workspaceId={workspaceId} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

function LogCompletionForm({
  taskId,
  workspaceId,
  isHoursBased,
  currentAssetHours,
}: {
  taskId: string
  workspaceId: string
  isHoursBased: boolean
  currentAssetHours?: number
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    startTransition(async () => {
      await logPmsCompletion({
        pmsTaskId: taskId,
        workspaceId,
        completedAt: data.get('completedAt') as string,
        hoursAtCompletion: isHoursBased ? Number(data.get('hours')) : undefined,
        notes: (data.get('notes') as string) || undefined,
      })
      setOpen(false)
    })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-lg bg-frame-orange/[.12] py-2 text-[12px] font-medium text-frame-orange hover:bg-frame-orange/[.18]"
        >
          Log Completion
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-frame-hairline bg-frame-surface-2 p-3">
          <p className="text-[11px] font-medium text-frame-ink">Log Completion</p>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-frame-ink-tertiary">Date</label>
            <input name="completedAt" type="date" defaultValue={today} required className="input-base" />
          </div>
          {isHoursBased && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-frame-ink-tertiary">Hours at completion</label>
              <input name="hours" type="number" defaultValue={currentAssetHours} required className="input-base" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-frame-ink-tertiary">Notes (optional)</label>
            <input name="notes" className="input-base" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-lg bg-frame-surface-1 py-1.5 text-[11px] text-frame-ink-subtle">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="flex-1 rounded-lg bg-frame-orange py-1.5 text-[11px] font-medium text-white disabled:opacity-50">
              {isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function CreateWOButton({ taskId, workspaceId }: { taskId: string; workspaceId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handle() {
    startTransition(async () => {
      const result = await createWorkOrderFromPms(taskId, workspaceId)
      if ('id' in result) {
        router.push(`/work-orders?id=${result.id}`)
      }
    })
  }

  return (
    <button
      onClick={handle}
      disabled={isPending}
      className="w-full rounded-lg border border-frame-hairline py-2 text-[12px] font-medium text-frame-ink-subtle hover:bg-frame-surface-2 disabled:opacity-50"
    >
      {isPending ? 'Creating…' : 'Create Work Order'}
    </button>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/maintenance/PmsTaskDetail.tsx
git commit -m "feat: PMS task detail slide-over with log completion and create WO"
```

---

## Task 13: Update Dashboard with live data

**Files:**
- Create: `src/components/dashboard/StatCards.tsx`
- Create: `src/components/dashboard/OpenWorkOrdersList.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Create StatCards component**

```tsx
// src/components/dashboard/StatCards.tsx
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatCard = {
  label: string
  value: number | string
  colorClass: string
  href?: string
}

export function StatCards({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => {
        const inner = (
          <Card key={card.label} className={card.href ? 'transition-colors hover:bg-frame-surface-2' : ''}>
            <CardHeader className="px-4 pb-1 pt-3">
              <CardTitle className="text-[11.5px] font-medium text-frame-ink-subtle mb-[7px]">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <span className={cn('text-[26px] font-light leading-none tabular-nums tracking-[-0.025em]', card.colorClass)}>
                {card.value}
              </span>
            </CardContent>
          </Card>
        )
        return card.href ? (
          <Link key={card.label} href={card.href}>{inner}</Link>
        ) : (
          <div key={card.label}>{inner}</div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create OpenWorkOrdersList component**

```tsx
// src/components/dashboard/OpenWorkOrdersList.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { WorkOrderListItem } from '@/modules/work-orders/types'

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date(new Date().toDateString())
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function OpenWorkOrdersList({ workOrders }: { workOrders: WorkOrderListItem[] }) {
  if (workOrders.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-[12px] text-frame-ink-tertiary">No open work orders</p>
      </div>
    )
  }

  return (
    <div>
      <div className="divide-y divide-frame-hairline">
        {workOrders.map((wo) => {
          const overdue = isOverdue(wo.dueDate)
          const priorityColor =
            wo.priority === 'high' ? 'bg-red-400' : wo.priority === 'medium' ? 'bg-frame-orange' : 'bg-amber-400'

          return (
            <Link
              key={wo.id}
              href={`/work-orders?id=${wo.id}`}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-frame-surface-2"
            >
              <span className={cn('h-[7px] w-[7px] flex-shrink-0 rounded-full', priorityColor)} />
              <span className="flex-shrink-0 text-[10px] text-frame-ink-tertiary">{wo.number}</span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-frame-ink">{wo.title}</span>
              <span className="flex-shrink-0 rounded bg-frame-surface-2 px-1.5 py-px text-[9px] text-frame-ink-tertiary">
                {wo.team === 'engineering' ? 'Eng' : wo.team === 'deck' ? 'Deck' : wo.team === 'interior' ? 'Int' : 'Charter'}
              </span>
              {wo.assignee && (
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-frame-orange text-[8px] font-bold text-white">
                  {initials(wo.assignee.displayName)}
                </span>
              )}
              {wo.dueDate && (
                <span className={cn('flex-shrink-0 text-[10px]', overdue ? 'text-red-400' : 'text-frame-ink-tertiary')}>
                  {overdue ? 'Overdue' : new Date(wo.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </Link>
          )
        })}
      </div>
      <div className="border-t border-frame-hairline px-4 py-2.5">
        <Link href="/work-orders" className="text-[11px] text-frame-ink-tertiary hover:text-frame-ink-subtle">
          View all work orders →
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Replace dashboard page**

```tsx
// src/app/(app)/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getWorkspaceByOrgId } from '@/modules/workspaces/queries'
import { getWorkOrderStats, getOpenWorkOrders } from '@/modules/work-orders/queries'
import { getPmsStats } from '@/modules/maintenance/queries'
import { Card, CardContent } from '@/components/ui/card'
import { StatCards } from '@/components/dashboard/StatCards'
import { OpenWorkOrdersList } from '@/components/dashboard/OpenWorkOrdersList'

export default async function DashboardPage() {
  const { orgId } = await auth()
  if (!orgId) redirect('/onboarding')

  const workspace = await getWorkspaceByOrgId(orgId)
  if (!workspace) redirect('/onboarding')

  const [woStats, pmsStats, openWOs] = await Promise.all([
    getWorkOrderStats(workspace.id),
    getPmsStats(workspace.id),
    getOpenWorkOrders(workspace.id, 10),
  ])

  const statCards = [
    {
      label: 'Open Work Orders',
      value: woStats.open + woStats.inProgress,
      colorClass: 'text-frame-ink',
      href: '/work-orders?status=open',
    },
    {
      label: 'Overdue Maintenance',
      value: pmsStats.overdue,
      colorClass: 'text-frame-orange',
      href: '/maintenance?status=overdue',
    },
    {
      label: 'Certs Expiring',
      value: 0,
      colorClass: 'text-frame-amber',
    },
    {
      label: 'Low Stock Items',
      value: 0,
      colorClass: 'text-red-400',
    },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] font-semibold tracking-[-0.03em] leading-[1.1] text-frame-ink">
          {workspace.name}
        </h1>
        <p className="text-[13px] text-frame-ink-subtle mt-[3px]">Dashboard</p>
      </div>

      <StatCards cards={statCards} />

      <Card>
        <div className="border-b border-frame-hairline px-4 py-3">
          <h2 className="text-[13px] font-semibold text-frame-ink">Open Work Orders</h2>
        </div>
        <CardContent className="p-0">
          <OpenWorkOrdersList workOrders={openWOs} />
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/app/(app)/dashboard/ src/components/dashboard/
git commit -m "feat: dashboard wired to live work order and maintenance data"
```

---

## Task 14: Enable sidebar nav items + deploy

**Files:**
- Modify: `src/components/shell/Sidebar.tsx`

- [ ] **Step 1: Enable Work Orders and Maintenance in NAV_ITEMS**

Find the `NAV_ITEMS` array in `src/components/shell/Sidebar.tsx`. Change `enabled: false` to `enabled: true` for Work Orders and Maintenance:

```typescript
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, enabled: true },
  { href: '/work-orders', label: 'Work Orders', icon: Wrench, enabled: true },   // ← changed
  { href: '/maintenance', label: 'Maintenance', icon: Clock, enabled: true },    // ← changed
  { href: '/inventory', label: 'Inventory', icon: Package, enabled: false },
  { href: '/certificates', label: 'Certificates', icon: FileText, enabled: false },
  { href: '/safety', label: 'Safety & ISM', icon: ShieldCheck, enabled: false },
  { href: '/documents', label: 'Documents', icon: File, enabled: false },
  { href: '/charter', label: 'Charter', icon: CalendarDays, enabled: false },
]
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit and deploy**

```bash
git add src/components/shell/Sidebar.tsx
git commit -m "feat: enable work orders and maintenance nav items"
git push origin main
```

Expected: Vercel build triggers, deploys Phase 2.

---

## Self-Review Notes

- `profiles` table uses `clerkUserId` (text) as PK — all FK references use `.references(() => profiles.clerkUserId)`, not uuid
- `fromPmsTaskId` in `workOrders` has no DB-level FK (to avoid circular import between schema files) — the uuid column exists but without `.references()`
- `calcPmsStatus` is a pure function — tested in isolation before any DB work
- WO number generation (`generateWorkOrderNumber`) is a pure function — tested in isolation
- `searchParams` in Next.js 15 is a `Promise` — always `await searchParams` before destructuring
- `date` columns from Drizzle return strings in `YYYY-MM-DD` format — compare using `new Date(dateStr)` not direct string comparison
- `input-base` CSS utility added to `globals.css` as a `@layer components` utility — used in WorkOrderSheet and PmsTaskDetail
