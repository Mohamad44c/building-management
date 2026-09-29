'use client'

import { Building2, LayoutDashboard, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { DashboardPeriodFilter } from '@/components/ui/dashboard-period-filter'
import type { DashboardDateFilterValue } from '@/lib/dashboardDateFilter'

type DashboardHeaderProps = {
  period: DashboardDateFilterValue
  onPeriodChange: (value: DashboardDateFilterValue) => void
  rangeLabel?: string
  comparisonLabel?: string
  isRefreshing: boolean
}

export function DashboardHeader({ period, onPeriodChange, rangeLabel, comparisonLabel, isRefreshing }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden>
              <Building2 className="size-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">Building dashboard</h1>
              <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground" aria-live="polite">
                {isRefreshing ? <Loader2 className="size-3 shrink-0 animate-spin" aria-hidden /> : null}
                {rangeLabel ? (
                  <span className="truncate">
                    {rangeLabel}
                    {comparisonLabel ? <span className="hidden sm:inline"> · vs {comparisonLabel}</span> : null}
                  </span>
                ) : (
                  'Loading…'
                )}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <HeaderActions />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DashboardPeriodFilter value={period} onChange={onPeriodChange} />
          <div className="hidden items-center gap-2 lg:flex">
            <HeaderActions />
          </div>
        </div>
      </div>
    </header>
  )
}

function HeaderActions() {
  return (
    <>
      <Button asChild variant="outline" size="sm">
        <Link href="/admin">
          <LayoutDashboard aria-hidden />
          <span className="hidden sm:inline">Admin</span>
          <span className="sr-only sm:hidden">Open admin</span>
        </Link>
      </Button>
      <ThemeToggle />
    </>
  )
}
