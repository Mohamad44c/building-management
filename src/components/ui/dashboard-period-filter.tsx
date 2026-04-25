'use client'

import type { DashboardPeriodPreset } from '@/lib/generatorStats'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type DashboardPeriodValue = {
  preset: DashboardPeriodPreset
  from?: string
  to?: string
}

type DashboardPeriodFilterProps = {
  value: DashboardPeriodValue
  onChange: (value: DashboardPeriodValue) => void
}

const presetOptions: Array<{ value: DashboardPeriodPreset; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
  { value: 'custom', label: 'Custom range' },
]

const todayDate = () => new Date().toISOString().slice(0, 10)

export function DashboardPeriodFilter({ value, onChange }: DashboardPeriodFilterProps) {
  const handlePresetChange = (preset: DashboardPeriodPreset) => {
    if (preset === 'custom') {
      onChange({
        preset,
        from: value.from || todayDate(),
        to: value.to || todayDate(),
      })
      return
    }

    onChange({ preset })
  }

  const handleCustomDateChange = (key: 'from' | 'to', dateValue: string) => {
    onChange({
      preset: 'custom',
      from: key === 'from' ? dateValue : value.from || todayDate(),
      to: key === 'to' ? dateValue : value.to || todayDate(),
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-end">
      <div className="w-full sm:w-[220px]">
        <label className="mb-2 block text-xs text-muted-foreground">Period</label>
        <Select value={value.preset} onValueChange={(next) => handlePresetChange(next as DashboardPeriodPreset)}>
          <SelectTrigger>
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {presetOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {value.preset === 'custom' ? (
        <>
          <div className="w-full sm:w-[180px]">
            <label className="mb-2 block text-xs text-muted-foreground">From</label>
            <input
              type="date"
              value={value.from || todayDate()}
              onChange={(event) => handleCustomDateChange('from', event.target.value)}
              aria-label="Custom period start date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            />
          </div>
          <div className="w-full sm:w-[180px]">
            <label className="mb-2 block text-xs text-muted-foreground">To</label>
            <input
              type="date"
              value={value.to || todayDate()}
              onChange={(event) => handleCustomDateChange('to', event.target.value)}
              aria-label="Custom period end date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
