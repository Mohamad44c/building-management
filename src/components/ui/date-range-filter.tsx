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
  onRangeChange: (range: DateRange) => void
  defaultValue?: DateRange
}

export function DateRangeFilter({ onRangeChange, defaultValue = 'month' }: DateRangeFilterProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>(defaultValue)

  const handleRangeChange = (value: DateRange) => {
    setSelectedRange(value)
    onRangeChange(value)
  }

  return (
    <div className="flex items-center space-x-2">
      <Select value={selectedRange} onValueChange={handleRangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Month</SelectItem>
          <SelectItem value="quarter">Quarter</SelectItem>
          <SelectItem value="year">Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
