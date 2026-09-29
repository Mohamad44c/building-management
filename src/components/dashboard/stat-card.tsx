'use client'

import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type StatCardProps = {
  label: string
  icon?: LucideIcon
  value?: ReactNode
  hint?: ReactNode
  footer?: ReactNode
  loading?: boolean
  badge?: ReactNode
  className?: string
}

export function StatCard({ label, icon: Icon, value, hint, footer, loading, badge, className }: StatCardProps) {
  return (
    <Card className={cn('gap-2 px-5 py-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {badge ?? (Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden /> : null)}
      </div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-40" />
        </>
      ) : (
        <>
          <div className="text-2xl font-semibold tracking-tight tabular-nums">{value ?? '—'}</div>
          {hint ? <div className="text-xs text-muted-foreground sm:text-sm">{hint}</div> : null}
          {footer}
        </>
      )}
    </Card>
  )
}

type DeltaProps = {
  current: number
  previous: number
  format: (value: number) => string
  /** Which direction is good news. 'neutral' shows the change without judging it. */
  goodWhen: 'up' | 'down' | 'neutral'
}

/** "+$120 (+8.5%) vs previous" with direction icon; colored only when a direction is good/bad. */
export function Delta({ current, previous, format, goodWhen }: DeltaProps) {
  if (!(previous > 0)) {
    return <p className="text-xs text-muted-foreground">No data in comparison period</p>
  }
  const delta = current - previous
  const percent = (delta / previous) * 100
  const flat = Math.abs(percent) < 0.05
  const Icon = flat ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight
  const tone =
    flat || goodWhen === 'neutral'
      ? 'text-muted-foreground'
      : (delta > 0) === (goodWhen === 'up')
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-red-600 dark:text-red-400'
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : ''

  return (
    <p className={cn('inline-flex items-center gap-1 text-xs font-medium tabular-nums', tone)}>
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {flat ? 'No change' : `${sign}${format(Math.abs(delta))} (${sign}${Math.abs(percent).toFixed(1)}%)`}
      <span className="font-normal text-muted-foreground">vs previous</span>
    </p>
  )
}
