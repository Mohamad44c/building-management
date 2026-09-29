'use client'

import type { LucideIcon } from 'lucide-react'
import { AlertCircle, RotateCw } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export type PanelStatus = 'loading' | 'error' | 'empty' | 'ready'

export function panelStatus(query: { isPending: boolean; isError: boolean; data?: unknown }, isEmpty = false): PanelStatus {
  if (query.data === undefined) return query.isError ? 'error' : 'loading'
  return isEmpty ? 'empty' : 'ready'
}

/** Small tag marking data that ignores the period filter. */
export function SnapshotBadge({ children = 'Live' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
      {children}
    </span>
  )
}

export function ErrorState({ message = 'Could not load this data.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex h-full min-h-24 flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-2 text-destructive-foreground">
        <AlertCircle className="size-4" aria-hidden />
        {message}
      </span>
      {onRetry ? (
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          <RotateCw aria-hidden /> Retry
        </Button>
      ) : null}
    </div>
  )
}

type PanelProps = {
  title: string
  description?: ReactNode
  icon?: LucideIcon
  badge?: ReactNode
  status: PanelStatus
  emptyMessage?: string
  onRetry?: () => void
  /** Height reserved for the body in every state, so the layout doesn't jump. */
  bodyClassName?: string
  className?: string
  children?: ReactNode
}

/** Card with a titled header and consistent loading / error / empty states. */
export function Panel({
  title,
  description,
  icon: Icon,
  badge,
  status,
  emptyMessage = 'Nothing to show for this period.',
  onRetry,
  bodyClassName,
  className,
  children,
}: PanelProps) {
  return (
    <Card className={cn('gap-4 py-5', className)}>
      <CardHeader className="gap-1 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden /> : null}
            <CardTitle className="text-sm font-semibold sm:text-base">{title}</CardTitle>
          </div>
          {badge}
        </div>
        {description ? <CardDescription className="text-xs sm:text-sm">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn('px-5', bodyClassName)}>
        {status === 'loading' ? (
          <Skeleton className="size-full min-h-24" />
        ) : status === 'error' ? (
          <ErrorState onRetry={onRetry} />
        ) : status === 'empty' ? (
          <div className="flex h-full min-h-24 items-center justify-center text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
