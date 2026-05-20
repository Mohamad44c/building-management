'use client'

import type { LucideIcon } from 'lucide-react'
import { useId } from 'react'

import { cn } from '@/lib/utils'

export type DashboardSectionProps = {
  title: string
  description?: string
  icon: LucideIcon
  iconClassName?: string
  children: React.ReactNode
}

export function DashboardSection({
  title,
  description,
  icon: Icon,
  iconClassName,
  children,
}: DashboardSectionProps) {
  const headingId = useId()

  return (
    <section
      className="space-y-4 sm:space-y-5"
      aria-labelledby={headingId}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card shadow-sm sm:size-12',
            iconClassName,
          )}
          aria-hidden
        >
          <Icon className="size-5 sm:size-6" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 space-y-1">
          <h2
            id={headingId}
            className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
          >
            {title}
          </h2>
          {description ? (
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  )
}
