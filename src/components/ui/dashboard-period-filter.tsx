'use client'

import { useMemo } from 'react'

import {
  DASHBOARD_PRESETS,
  recentMonthOptions,
  type DashboardDateFilterValue,
} from '@/lib/dashboardDateFilter'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type DashboardPeriodFilterProps = {
  value: DashboardDateFilterValue
  onChange: (value: DashboardDateFilterValue) => void
}

export function DashboardPeriodFilter({ value, onChange }: DashboardPeriodFilterProps) {
  const months = useMemo(() => recentMonthOptions(12), [])
  const selectedMonth = value.mode === 'month' ? `${value.year}-${value.monthIndex}` : ''

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div
        role="radiogroup"
        aria-label="Reporting period"
        className="grid grid-cols-2 gap-1 rounded-lg border bg-muted/50 p-1 sm:inline-flex"
      >
        {DASHBOARD_PRESETS.map((option) => {
          const active = value.mode === 'preset' && value.preset === option.value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange({ mode: 'preset', preset: option.value })}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      <Select
        value={selectedMonth}
        onValueChange={(v) => {
          const [year, monthIndex] = v.split('-').map(Number)
          onChange({ mode: 'month', year, monthIndex })
        }}
      >
        <SelectTrigger
          className={cn('w-full sm:w-[190px]', value.mode === 'month' && 'border-primary ring-1 ring-primary/30')}
          aria-label="Pick a specific month"
        >
          <SelectValue placeholder="Pick a month…" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={`${month.year}-${month.monthIndex}`} value={`${month.year}-${month.monthIndex}`}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
