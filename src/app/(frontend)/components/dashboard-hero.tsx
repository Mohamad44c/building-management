'use client'

import { Building2, Sparkles } from 'lucide-react'

import { ThemeToggle } from '@/components/theme-toggle'
import {
  DashboardPeriodFilter,
  type DashboardPeriodValue,
} from '@/components/ui/dashboard-period-filter'

export type DashboardHeroProps = {
  period: DashboardPeriodValue
  onPeriodChange: (value: DashboardPeriodValue) => void
}

export function DashboardHero({ period, onPeriodChange }: DashboardHeroProps) {
  return (
    <header className="overflow-hidden rounded-2xl border border-border/80 bg-card/60 p-5 shadow-sm ring-1 ring-black/5 backdrop-blur-sm dark:bg-card/40 dark:ring-white/10 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="space-y-4 sm:space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-200">
            <Sparkles className="size-3.5 shrink-0" aria-hidden />
            <span>Portfolio overview</span>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-11"
                aria-hidden
              >
                <Building2 className="size-5 sm:size-6" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 space-y-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Building management dashboard
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg">
                  Monitor expenses, diesel consumption, generator usage, and payments across your
                  buildings with clear, period-aware analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          <ThemeToggle />
        </div>
      </div>
      <div className="mt-6 border-t border-border/60 pt-6 sm:mt-8 sm:pt-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Reporting period
        </p>
        <DashboardPeriodFilter value={period} onChange={onPeriodChange} />
      </div>
    </header>
  )
}
