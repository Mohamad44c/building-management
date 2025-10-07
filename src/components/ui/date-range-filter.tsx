import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

export type DateRange = 'month' | 'quarter' | 'year'

interface DateRangeFilterProps {
  onMonthChange: (monthIndex: number) => void
  defaultValue?: number
}

export function DateRangeFilter({ onMonthChange, defaultValue }: DateRangeFilterProps) {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Use current month as default if no defaultValue provided
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultValue ?? currentMonth)

  // Generate months for current year (0-11, excluding future months)
  const availableMonths = Array.from({ length: currentMonth + 1 }, (_, index) => {
    const monthDate = new Date(currentYear, index, 1)
    return {
      value: index,
      label: monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    }
  })

  const handleMonthChange = (value: string) => {
    const monthIndex = parseInt(value)
    setSelectedMonth(monthIndex)
    onMonthChange(monthIndex)
  }

  return (
    <div className="flex items-center space-x-2">
      <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select month" />
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
