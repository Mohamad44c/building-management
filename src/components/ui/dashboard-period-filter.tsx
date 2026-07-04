'use client'

import type { DashboardDateFilterPreset, DashboardDateFilterValue } from '@/lib/dashboardDateFilter'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type DashboardPeriodFilterProps = {
  value: DashboardDateFilterValue
  onChange: (value: DashboardDateFilterValue) => void
}

const presetOptions: Array<{ value: DashboardDateFilterPreset; label: string }> = [
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'last-3-months', label: 'Last 3 months' },
]

export function DashboardPeriodFilter({ value, onChange }: DashboardPeriodFilterProps) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // Months for the current year, up to and including the current month only.
  const availableMonths = Array.from({ length: currentMonth + 1 }, (_, index) => {
    const monthDate = new Date(currentYear, index, 1)
    return {
      value: index,
      label: monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    }
  })

  const handlePresetClick = (preset: DashboardDateFilterPreset) => {
    onChange({ mode: 'preset', preset })
  }

  const handleMonthChange = (monthValue: string) => {
    onChange({ mode: 'month', monthIndex: parseInt(monthValue, 10), year: currentYear })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-2">
        {presetOptions.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={value.mode === 'preset' && value.preset === option.value ? 'default' : 'outline'}
            onClick={() => handlePresetClick(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <Select
        value={value.mode === 'month' ? value.monthIndex.toString() : ''}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="w-full sm:w-[200px]" aria-label="Pick a specific month">
          <SelectValue placeholder="Pick a month..." />
        </SelectTrigger>
        <SelectContent>
          {availableMonths.map((month) => (
            <SelectItem key={month.value} value={month.value.toString()}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
