# Design Polish — Component System Pass

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared component vocabulary to `globals.css` as `@layer components`, then update every existing page component to use it — eliminating scattered inline utilities and matching the prototype's visual quality.

**Architecture:** All new classes live in `src/app/globals.css` inside `@layer components` using `@apply`. No new files are created. Components swap their inline utility strings for the new shared classes. No logic, DB, or layout changes.

**Tech Stack:** Next.js 15 App Router, Tailwind v4, `@layer components` with `@apply`, TypeScript.

---

### Task 1: Component vocabulary — `globals.css`

**Files:**
- Modify: `src/app/globals.css` (add to existing `@layer components` block, lines 45-49)

This task defines every shared class the rest of the plan depends on. Do this first.

- [ ] **Step 1: Open the file and verify the existing `@layer components` block**

Read `src/app/globals.css`. Confirm `@layer components` starts at line 45 and contains only `.input-base`. You'll be adding more classes into this same block.

- [ ] **Step 2: Replace the `@layer components` block with the full component vocabulary**

Replace lines 45–49 (the existing `@layer components { .input-base { … } }` block) with:

```css
@layer components {
  /* ── Input ── */
  .input-base {
    @apply w-full rounded-lg border border-frame-hairline bg-frame-surface-2 px-2.5 py-2 text-[12px] text-frame-ink placeholder:text-frame-ink-tertiary focus:outline-none focus:ring-1 focus:ring-frame-orange;
  }

  /* ── Badges — base ── */
  .badge {
    @apply inline-flex items-center rounded-full px-[9px] py-[2px] text-[11px] font-medium whitespace-nowrap;
  }

  /* Status variants */
  .b-open     { @apply bg-blue-500/10 text-blue-400; }
  .b-progress { @apply bg-frame-amber/10 text-frame-amber; }
  .b-hold     { @apply bg-amber-400/10 text-amber-400 ring-[0.5px] ring-amber-400/25; }
  .b-done     { @apply bg-frame-green/10 text-frame-green; }

  /* Priority variants */
  .b-high   { @apply bg-frame-red/10 text-frame-red; }
  .b-medium { @apply bg-frame-orange/10 text-frame-orange; }
  .b-low    { @apply bg-frame-green/10 text-frame-green; }

  /* Team variants */
  .b-engineering { @apply bg-cyan-400/10 text-cyan-400; }
  .b-deck        { @apply bg-purple-400/10 text-purple-400; }
  .b-interior    { @apply bg-frame-green/10 text-frame-green; }
  .b-charter     { @apply bg-frame-orange/10 text-frame-orange; }

  /* ── Stat numbers ── */
  .stat-num {
    @apply text-[52px] font-semibold leading-none tracking-[-0.05em] text-frame-ink tabular-nums;
  }
  .stat-lbl {
    @apply text-[10px] font-semibold uppercase tracking-[0.08em] text-frame-ink-tertiary;
  }

  /* ── Filter pills ── */
  .fp {
    @apply px-3 py-[5px] rounded-full text-[12px] font-medium cursor-pointer border-0
           text-frame-ink-tertiary bg-transparent transition-colors
           hover:text-frame-ink-subtle hover:bg-frame-surface-3;
  }
  .fp.on {
    @apply bg-frame-surface-4 text-frame-ink;
  }
  .fp-sep {
    @apply w-px self-stretch bg-frame-hairline-strong mx-1.5 flex-shrink-0;
  }

  /* ── Buttons (btn-f-* prefix avoids shadcn conflicts) ── */
  .btn-f-base {
    @apply inline-flex items-center gap-1.5 rounded-lg text-[12px] font-medium
           cursor-pointer border-0 transition-colors whitespace-nowrap select-none;
  }
  .btn-f-primary {
    @apply btn-f-base bg-frame-orange text-white px-3 py-[6px] hover:bg-frame-orange-hover;
  }
  .btn-f-ghost {
    @apply btn-f-base bg-transparent text-frame-ink-subtle px-2.5 py-[5px]
           hover:bg-frame-surface-2 hover:text-frame-ink;
  }
  /* Size modifier — define last so it overrides primary/ghost padding */
  .btn-f-sm {
    @apply px-2 py-[3px] text-[11px];
  }
}
```

- [ ] **Step 3: Build to verify no syntax errors**

Run:
```bash
cd /Users/albertday/Downloads/frame-marine-app && npx tsc --noEmit
```
Expected: no errors. The CSS changes don't affect TypeScript, but this confirms the project still compiles.

- [ ] **Step 4: Commit**

```bash
cd /Users/albertday/Downloads/frame-marine-app
git add src/app/globals.css
git commit -m "feat: add shared component vocabulary to globals.css"
```

---

### Task 2: Stat strips — `WorkOrderStatStrip` + `PmsStatStrip`

**Files:**
- Modify: `src/components/work-orders/WorkOrderStatStrip.tsx`
- Modify: `src/components/maintenance/PmsStatStrip.tsx`

Both strips currently show tiny `text-[13px] font-light` numbers. The spec calls for `stat-num` (52px, bold) matching the prototype.

- [ ] **Step 1: Rewrite `WorkOrderStatStrip.tsx`**

Replace the entire file with:

```tsx
// src/components/work-orders/WorkOrderStatStrip.tsx
import type { WorkOrderStats } from '@/modules/work-orders/types'

export function WorkOrderStatStrip({ stats }: { stats: WorkOrderStats }) {
  const items = [
    { label: 'Open',         value: stats.open },
    { label: 'In Progress',  value: stats.inProgress },
    { label: 'On Hold',      value: stats.onHold },
    { label: 'High Priority', value: stats.highPriority },
  ]

  return (
    <div className="flex border-b border-frame-hairline">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`flex flex-col gap-2 px-5 py-4 ${i < items.length - 1 ? 'border-r border-frame-hairline' : ''}`}
        >
          <span className="stat-num">{item.value}</span>
          <span className="stat-lbl">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `PmsStatStrip.tsx`**

Replace the entire file with:

```tsx
// src/components/maintenance/PmsStatStrip.tsx
import type { PmsStats } from '@/modules/maintenance/types'

export function PmsStatStrip({ stats }: { stats: PmsStats }) {
  const items = [
    { label: 'Overdue',  value: stats.overdue,  numClass: 'stat-num text-frame-red' },
    { label: 'Due Soon', value: stats.dueSoon,   numClass: 'stat-num text-frame-amber' },
    { label: 'Upcoming', value: stats.upcoming,  numClass: 'stat-num' },
  ]

  return (
    <div className="flex border-b border-frame-hairline">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`flex flex-col gap-2 px-5 py-4 ${i < items.length - 1 ? 'border-r border-frame-hairline' : ''}`}
        >
          <span className={item.numClass}>{item.value}</span>
          <span className="stat-lbl">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Build to verify**

```bash
cd /Users/albertday/Downloads/frame-marine-app && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/work-orders/WorkOrderStatStrip.tsx src/components/maintenance/PmsStatStrip.tsx
git commit -m "feat: use stat-num typography in work order and maintenance stat strips"
```

---

### Task 3: Work order list — team badges + row polish

**Files:**
- Modify: `src/components/work-orders/WorkOrderList.tsx`

`TeamBadge` currently uses a plain grey surface with no color. Replace with `.badge` + team variant classes.

- [ ] **Step 1: Rewrite `WorkOrderList.tsx`**

Replace the entire file with:

```tsx
// src/components/work-orders/WorkOrderList.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { WorkOrderListItem } from '@/modules/work-orders/types'

const TEAM_CLS: Record<string, string> = {
  engineering: 'b-engineering',
  deck: 'b-deck',
  interior: 'b-interior',
  charter: 'b-charter',
}
const TEAM_LABEL: Record<string, string> = {
  engineering: 'Eng',
  deck: 'Deck',
  interior: 'Int',
  charter: 'Charter',
}

function PriorityDot({ priority }: { priority: 'high' | 'medium' | 'low' | null }) {
  const color =
    priority === 'high'   ? 'bg-frame-red' :
    priority === 'medium' ? 'bg-frame-orange' :
    priority === 'low'    ? 'bg-frame-amber' :
    'bg-frame-ink-tertiary'
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
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
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
              'flex items-start gap-2.5 rounded-lg px-3 py-2.5 transition-colors',
              wo.id === selectedId
                ? 'bg-frame-orange/[.13]'
                : 'hover:bg-frame-surface-2'
            )}
          >
            <PriorityDot priority={wo.priority} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-frame-ink-tertiary">{wo.number}</span>
                <span
                  className={cn(
                    'truncate text-[12.5px] font-medium leading-snug',
                    wo.id === selectedId ? 'text-frame-orange' : 'text-frame-ink'
                  )}
                >
                  {wo.title}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={`badge ${TEAM_CLS[wo.team] ?? ''}`}>
                  {TEAM_LABEL[wo.team] ?? wo.team}
                </span>
                {wo.assignee && (
                  <span className="flex h-[16px] w-[16px] flex-shrink-0 items-center justify-center rounded-full bg-frame-orange text-[8px] font-bold text-white">
                    {initials(wo.assignee.displayName)}
                  </span>
                )}
                {wo.dueDate && (
                  <span className={cn('text-[10px]', overdue ? 'text-frame-red' : 'text-frame-ink-tertiary')}>
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
```

- [ ] **Step 2: Build to verify**

```bash
cd /Users/albertday/Downloads/frame-marine-app && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/work-orders/WorkOrderList.tsx
git commit -m "feat: color-coded team badges and row polish in WorkOrderList"
```

---

### Task 4: Work order detail — status pills, subtasks, comments

**Files:**
- Modify: `src/components/work-orders/WorkOrderDetail.tsx`

This is the biggest visual change. Status selector becomes color-coded badge buttons. Comment bubble gets a surface background. Subtask checkbox gets the correct border treatment. Section labels become eyebrow style. Action buttons use `btn-f-*`.

- [ ] **Step 1: Rewrite `WorkOrderDetail.tsx`**

Replace the entire file with:

```tsx
// src/components/work-orders/WorkOrderDetail.tsx
'use client'

import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import {
  addComment,
  addSubtask,
  toggleSubtask,
  updateWorkOrderStatus,
} from '@/modules/work-orders/actions'
import type { WorkOrderWithRelations } from '@/modules/work-orders/types'

const STATUS_OPTIONS = [
  { value: 'open',        label: 'Open',        cls: 'b-open'     },
  { value: 'in_progress', label: 'In Progress',  cls: 'b-progress' },
  { value: 'on_hold',     label: 'On Hold',      cls: 'b-hold'     },
  { value: 'done',        label: 'Done',         cls: 'b-done'     },
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

export function WorkOrderDetail({ workOrder: workOrderProp }: Props) {
  const [isPending, startTransition] = useTransition()

  if (!workOrderProp) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[12px] text-frame-ink-tertiary">Select a work order</p>
      </div>
    )
  }

  const workOrder = workOrderProp
  const completedCount = workOrder.subtasks.filter((s) => s.completed).length
  const totalCount = workOrder.subtasks.length

  function handleStatusChange(status: typeof STATUS_OPTIONS[number]['value']) {
    startTransition(async () => {
      await updateWorkOrderStatus(workOrder.id, status)
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
        <p className="font-mono text-[10px] text-frame-ink-tertiary">{workOrder.number}</p>
        <h2 className="mt-0.5 text-[15px] font-semibold leading-tight tracking-[-0.02em] text-frame-ink">
          {workOrder.title}
        </h2>
        {/* Status selector — badge buttons */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              disabled={isPending}
              className={cn(
                'badge cursor-pointer transition-opacity',
                opt.cls,
                workOrder.status === opt.value
                  ? 'ring-1 ring-white/20 opacity-100'
                  : 'opacity-40 hover:opacity-70'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {[
            { label: 'System',   value: workOrder.system },
            { label: 'Zone',     value: workOrder.zone },
            { label: 'Team',     value: workOrder.team ? workOrder.team.charAt(0).toUpperCase() + workOrder.team.slice(1) : null },
            { label: 'Assignee', value: workOrder.assignee?.displayName },
            { label: 'Due',      value: workOrder.dueDate ?? null },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="stat-lbl mb-0.5">{label}</p>
              <p className="text-[12px] text-frame-ink-subtle">{value ?? '—'}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        {workOrder.description && (
          <div>
            <p className="stat-lbl mb-1.5">Description</p>
            <p className="text-[12.5px] leading-relaxed text-frame-ink-subtle">{workOrder.description}</p>
          </div>
        )}

        {/* Subtasks */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="stat-lbl">Subtasks</p>
            {totalCount > 0 && (
              <p className="text-[10px] text-frame-ink-tertiary">{completedCount}/{totalCount}</p>
            )}
          </div>
          {totalCount > 0 && (
            <div className="mb-2.5 h-1 overflow-hidden rounded-full bg-frame-surface-2">
              <div
                className="h-full rounded-full bg-frame-orange transition-all"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
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
                      : 'border-frame-hairline-strong bg-transparent text-transparent'
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
          <p className="stat-lbl mb-2.5">Comments</p>
          <div className="space-y-3">
            {workOrder.comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5">
                <span className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-frame-orange text-[8px] font-bold text-white">
                  {initials(comment.author.displayName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-[11px] font-medium text-frame-ink">{comment.author.displayName}</span>
                    <span className="text-[10px] text-frame-ink-tertiary">{formatDateTime(comment.createdAt)}</span>
                  </div>
                  <p className="rounded-lg bg-frame-surface-2 px-2.5 py-2 text-[12px] leading-relaxed text-frame-ink-subtle">
                    {comment.text}
                  </p>
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
    <form onSubmit={handleSubmit} className="mt-2.5 flex gap-2">
      <input
        name="text"
        placeholder="Add subtask…"
        disabled={isPending}
        className="flex-1 input-base"
      />
      <button type="submit" disabled={isPending} className="btn-f-ghost btn-f-sm">
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
        className="input-base resize-none"
      />
      <button type="submit" disabled={isPending} className="btn-f-primary btn-f-sm disabled:opacity-50">
        Comment
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Build to verify**

```bash
cd /Users/albertday/Downloads/frame-marine-app && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/work-orders/WorkOrderDetail.tsx
git commit -m "feat: status badge pills, comment bubbles, and button polish in WorkOrderDetail"
```

---

### Task 5: Work order sheet — button polish

**Files:**
- Modify: `src/components/work-orders/WorkOrderSheet.tsx`

Trigger button and form buttons use inline utilities that should now be `btn-f-*` classes. The `SheetTrigger` className becomes `btn-f-primary` (which is now defined in globals).

- [ ] **Step 1: Rewrite `WorkOrderSheet.tsx`**

Replace the entire file with:

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
        team: data.get('team') as 'engineering' | 'deck' | 'interior' | 'charter',
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
      <SheetTrigger className="btn-f-primary">
        <Plus size={13} />
        New Work Order
      </SheetTrigger>
      <SheetContent side="right" className="w-[380px] border-frame-hairline bg-frame-surface-1 p-0">
        <SheetHeader className="border-b border-frame-hairline px-5 py-4">
          <SheetTitle className="text-[14px] font-semibold text-frame-ink">New Work Order</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-4">
          <Field label="Title" required>
            <input name="title" required placeholder="Describe the work…" className="input-base" />
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
            <button type="button" onClick={() => setOpen(false)} className="btn-f-ghost">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-f-primary disabled:opacity-50">
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
      <label className="text-[11px] font-medium text-frame-ink-subtle">
        {label}{required && <span className="ml-0.5 text-frame-orange">*</span>}
      </label>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Build to verify**

```bash
cd /Users/albertday/Downloads/frame-marine-app && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/work-orders/WorkOrderSheet.tsx
git commit -m "feat: btn-f-* button classes in WorkOrderSheet"
```

---

### Task 6: Maintenance list — status badges + row polish

**Files:**
- Modify: `src/components/maintenance/PmsTaskList.tsx`

`StatusPill` uses inline Tailwind. Replace with `.badge` + status variants. The existing `StatusDot` can stay — it's a small accent, not a text badge.

- [ ] **Step 1: Rewrite `PmsTaskList.tsx`**

Replace the entire file with:

```tsx
// src/components/maintenance/PmsTaskList.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { PmsTaskWithStatus } from '@/modules/maintenance/types'

function StatusDot({ status }: { status: 'overdue' | 'due_soon' | 'upcoming' }) {
  const color =
    status === 'overdue'  ? 'bg-frame-red' :
    status === 'due_soon' ? 'bg-frame-amber' :
    'bg-frame-green'
  return <span className={cn('mt-0.5 h-[7px] w-[7px] flex-shrink-0 rounded-full', color)} />
}

function StatusPill({ status }: { status: 'overdue' | 'due_soon' | 'upcoming' }) {
  const cls =
    status === 'overdue'  ? 'b-high' :
    status === 'due_soon' ? 'b-progress' :
    'b-done'
  const labels = { overdue: 'Overdue', due_soon: 'Due Soon', upcoming: 'Upcoming' }
  return <span className={`badge ${cls}`}>{labels[status]}</span>
}

function ProgressBar({ task }: { task: PmsTaskWithStatus }) {
  let pct = 0
  if (task.intervalType === 'hours' && task.nextDueHours && task.asset?.currentHours != null) {
    const start = task.nextDueHours - task.intervalValue
    pct = ((task.asset.currentHours - start) / task.intervalValue) * 100
  } else if (task.intervalType === 'date' && task.nextDueDate && task.lastCompletedAt) {
    const start = new Date(task.lastCompletedAt).getTime()
    const end   = new Date(task.nextDueDate).getTime()
    pct = ((Date.now() - start) / (end - start)) * 100
  }
  pct = Math.min(pct, 110)
  const color =
    pct >= 100 ? 'bg-frame-red' :
    pct >= 85  ? 'bg-frame-amber' :
    'bg-frame-green'
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
            ? task.nextDueHours != null ? `${task.nextDueHours.toLocaleString()} hrs` : '—'
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

- [ ] **Step 2: Build to verify**

```bash
cd /Users/albertday/Downloads/frame-marine-app && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/maintenance/PmsTaskList.tsx
git commit -m "feat: badge status pills and color dot alignment in PmsTaskList"
```

---

### Task 7: Maintenance detail + asset hours — button polish

**Files:**
- Modify: `src/components/maintenance/PmsTaskDetail.tsx`
- Modify: `src/components/maintenance/AssetHoursPanel.tsx`

Replace inline button utility strings with `btn-f-*` classes. Section labels become eyebrow style using `stat-lbl`.

- [ ] **Step 1: Rewrite `PmsTaskDetail.tsx`**

Replace the entire file with:

```tsx
// src/components/maintenance/PmsTaskDetail.tsx
'use client'

import { useTransition, useState } from 'react'
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
      <SheetContent side="right" className="w-[400px] overflow-y-auto border-frame-hairline bg-frame-surface-1 p-0">
        <SheetHeader className="border-b border-frame-hairline px-5 py-4">
          <SheetTitle className="text-[14px] font-semibold text-frame-ink">{task.taskName}</SheetTitle>
          <p className="text-[11px] text-frame-ink-tertiary">{task.assetName} · {task.system}</p>
        </SheetHeader>

        <div className="space-y-5 px-5 py-4">
          {/* Interval info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="stat-lbl mb-0.5">Interval</p>
              <p className="text-[12px] text-frame-ink-subtle">
                {task.intervalType === 'hours' ? `Every ${task.intervalValue} hrs` : `Every ${task.intervalValue} months`}
              </p>
            </div>
            <div>
              <p className="stat-lbl mb-0.5">Last Completed</p>
              <p className="text-[12px] text-frame-ink-subtle">{task.lastCompletedAt ?? '—'}</p>
            </div>
            <div>
              <p className="stat-lbl mb-0.5">Next Due</p>
              <p className="text-[12px] text-frame-ink-subtle">
                {task.intervalType === 'hours'
                  ? task.nextDueHours != null ? `${task.nextDueHours.toLocaleString()} hrs` : '—'
                  : task.nextDueDate ?? '—'}
              </p>
            </div>
          </div>

          {/* Completion history */}
          {task.completionHistory.length > 0 && (
            <div>
              <p className="stat-lbl mb-2">Recent Completions</p>
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

          <LogCompletionForm
            taskId={task.id}
            workspaceId={workspaceId}
            isHoursBased={task.intervalType === 'hours'}
            currentAssetHours={task.asset?.currentHours ?? undefined}
          />

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
          <p className="text-[11px] font-semibold text-frame-ink">Log Completion</p>
          <div className="flex flex-col gap-1">
            <label className="stat-lbl">Date</label>
            <input name="completedAt" type="date" defaultValue={today} required className="input-base" />
          </div>
          {isHoursBased && (
            <div className="flex flex-col gap-1">
              <label className="stat-lbl">Hours at completion</label>
              <input name="hours" type="number" defaultValue={currentAssetHours} required className="input-base" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="stat-lbl">Notes (optional)</label>
            <input name="notes" className="input-base" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-f-ghost flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-f-primary flex-1 justify-center disabled:opacity-50">
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
      className="btn-f-ghost w-full justify-center border border-frame-hairline disabled:opacity-50"
    >
      {isPending ? 'Creating…' : 'Create Work Order'}
    </button>
  )
}
```

- [ ] **Step 2: Rewrite `AssetHoursPanel.tsx`**

Replace the entire file with:

```tsx
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
        {collapsed
          ? <ChevronRight size={13} className="text-frame-ink-tertiary" />
          : <ChevronDown size={13} className="text-frame-ink-tertiary" />}
        <span className="stat-lbl">Engine Hours</span>
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
          className="btn-f-ghost btn-f-sm tabular-nums"
        >
          {parseInt(value).toLocaleString()} hrs
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Build to verify**

```bash
cd /Users/albertday/Downloads/frame-marine-app && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/maintenance/PmsTaskDetail.tsx src/components/maintenance/AssetHoursPanel.tsx
git commit -m "feat: btn-f-* buttons and stat-lbl section labels in maintenance components"
```

---

### Task 8: Dashboard — StatCards + OpenWorkOrdersList

**Files:**
- Modify: `src/components/dashboard/StatCards.tsx`
- Modify: `src/components/dashboard/OpenWorkOrdersList.tsx`

`StatCards` uses `text-[26px] font-light` — bump to `text-[32px] font-semibold tracking-[-0.04em]`. `OpenWorkOrdersList` team badge uses plain grey surface — replace with `.badge` + team variant.

- [ ] **Step 1: Rewrite `StatCards.tsx`**

Replace the entire file with:

```tsx
// src/components/dashboard/StatCards.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'

type StatCard = {
  label: string
  value: number | string
  colorClass?: string
  href?: string
}

export function StatCards({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => {
        const inner = (
          <div className={cn(
            'rounded-xl border border-frame-hairline bg-frame-surface-1 p-4',
            card.href && 'transition-colors hover:bg-frame-surface-2'
          )}>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-frame-ink-tertiary">
              {card.label}
            </p>
            <span className={cn(
              'text-[32px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-frame-ink',
              card.colorClass
            )}>
              {card.value}
            </span>
          </div>
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

- [ ] **Step 2: Rewrite `OpenWorkOrdersList.tsx`**

Replace the entire file with:

```tsx
// src/components/dashboard/OpenWorkOrdersList.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { WorkOrderListItem } from '@/modules/work-orders/types'

const TEAM_CLS: Record<string, string> = {
  engineering: 'b-engineering',
  deck: 'b-deck',
  interior: 'b-interior',
  charter: 'b-charter',
}
const TEAM_LABEL: Record<string, string> = {
  engineering: 'Eng',
  deck: 'Deck',
  interior: 'Int',
  charter: 'Charter',
}

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
            wo.priority === 'high'   ? 'bg-frame-red' :
            wo.priority === 'medium' ? 'bg-frame-orange' :
            'bg-frame-amber'

          return (
            <Link
              key={wo.id}
              href={`/work-orders?id=${wo.id}`}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-frame-surface-2"
            >
              <span className={cn('h-[7px] w-[7px] flex-shrink-0 rounded-full', priorityColor)} />
              <span className="flex-shrink-0 font-mono text-[10px] text-frame-ink-tertiary">{wo.number}</span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-frame-ink">{wo.title}</span>
              <span className={`badge ${TEAM_CLS[wo.team] ?? ''}`}>
                {TEAM_LABEL[wo.team] ?? wo.team}
              </span>
              {wo.assignee && (
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-frame-orange text-[8px] font-bold text-white">
                  {initials(wo.assignee.displayName)}
                </span>
              )}
              {wo.dueDate && (
                <span className={cn('flex-shrink-0 text-[10px]', overdue ? 'text-frame-red' : 'text-frame-ink-tertiary')}>
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

- [ ] **Step 3: Build to verify**

```bash
cd /Users/albertday/Downloads/frame-marine-app && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/StatCards.tsx src/components/dashboard/OpenWorkOrdersList.tsx
git commit -m "feat: larger stat numbers and color-coded team badges on dashboard"
```

---

### Task 9: Sidebar nav — active state refinement

**Files:**
- Modify: `src/components/shell/SidebarNavItem.tsx`

Active nav item currently uses `bg-frame-orange/[.13] text-frame-orange`. The spec calls for `bg-frame-surface-2 text-frame-ink` (neutral surface, not orange glow). The orange text on the icon is already expressive enough.

- [ ] **Step 1: Rewrite `SidebarNavItem.tsx`**

Replace the entire file with:

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
          ? 'bg-frame-surface-2 text-frame-ink'
          : disabled
          ? 'cursor-not-allowed opacity-30 text-frame-ink-tertiary'
          : 'cursor-pointer text-frame-ink-tertiary hover:bg-frame-surface-2 hover:text-frame-ink'
      )}
    >
      <Icon
        size={15}
        className={cn('flex-shrink-0', isActive && 'text-frame-orange')}
      />
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

- [ ] **Step 2: Build to verify**

```bash
cd /Users/albertday/Downloads/frame-marine-app && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/shell/SidebarNavItem.tsx
git commit -m "feat: surface-2 active state with orange icon accent in sidebar nav"
```

---

### Task 10: Topbar quick-add button

**Files:**
- Modify: `src/components/shell/TopbarClient.tsx`

Add a `+ New work order` orange button on the right side of the topbar. It opens `WorkOrderSheet`. The topbar is already a client component, so `useOrganization()` from Clerk can be called directly. The Clerk org ID is the workspaceId used throughout the app.

- [ ] **Step 1: Rewrite `TopbarClient.tsx`**

Replace the entire file with:

```tsx
'use client'

import { Bell, Search } from 'lucide-react'
import { useOrganization } from '@clerk/nextjs'
import { WorkOrderSheet } from '@/components/work-orders/WorkOrderSheet'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'

type TopbarClientProps = { breadcrumb: string }

export function TopbarClient({ breadcrumb }: TopbarClientProps) {
  const { organization } = useOrganization()

  return (
    <div className="flex h-11 flex-shrink-0 items-center gap-3 border-b border-frame-hairline bg-[#0d0e0f] px-4">
      <WorkspaceSwitcher />

      <div className="h-4 w-px bg-frame-hairline flex-shrink-0" />

      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-frame-ink-tertiary">Frame</span>
        <span className="text-frame-hairline-3">›</span>
        <span className="font-medium text-frame-ink">{breadcrumb}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          className="flex items-center gap-[6px] rounded-[7px] border border-frame-hairline bg-frame-surface-1 px-[11px] py-[5px] text-[12px] text-frame-ink-tertiary transition-colors hover:bg-frame-surface-2 hover:text-frame-ink-subtle"
          aria-label="Search"
        >
          <Search size={13} />
          <span>Search</span>
        </button>
        {organization?.id && (
          <WorkOrderSheet workspaceId={organization.id} />
        )}
        <button
          className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-frame-hairline bg-frame-surface-1 text-frame-ink-tertiary transition-colors hover:bg-frame-surface-2 hover:text-frame-ink-subtle"
          aria-label="Notifications"
        >
          <Bell size={14} />
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build to verify**

```bash
cd /Users/albertday/Downloads/frame-marine-app && npx tsc --noEmit
```
Expected: no errors. If TypeScript complains about `WorkOrderSheet` import, verify the path resolves: `src/components/work-orders/WorkOrderSheet.tsx`.

- [ ] **Step 3: Full production build**

```bash
cd /Users/albertday/Downloads/frame-marine-app && npm run build
```
Expected: build completes with no errors. This confirms the entire app compiles for deployment.

- [ ] **Step 4: Commit**

```bash
git add src/components/shell/TopbarClient.tsx
git commit -m "feat: quick-add New Work Order button in topbar"
```

---

## Visual Verification Checklist

After all tasks are complete, open the dev server (`npm run dev`) and confirm:

- [ ] Work Orders stat strip shows large 52px bold numbers (Open / In Progress / On Hold / High Priority)
- [ ] Maintenance stat strip shows large numbers with Overdue in red, Due Soon in amber
- [ ] Work order list rows: team badge is color-coded (cyan for Eng, purple for Deck)
- [ ] Work order detail status selector: each status shows as a colored badge pill, active has ring, inactive is dimmed
- [ ] Comment bubbles have `bg-frame-surface-2` background
- [ ] Work order sheet Cancel/Create buttons look like `btn-f-ghost` / `btn-f-primary`
- [ ] Maintenance list status badges are color-coded (red for Overdue, amber for Due Soon, green for Upcoming)
- [ ] Dashboard stat cards show 32px bold numbers
- [ ] Dashboard WO list team badges are color-coded
- [ ] Sidebar active item: surface-2 background with orange icon (no orange glow on the row)
- [ ] Topbar: orange "+ New Work Order" button opens the WorkOrderSheet slide-over
