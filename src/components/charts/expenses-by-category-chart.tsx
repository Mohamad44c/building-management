'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangeFilter, type DateRange } from '@/components/ui/date-range-filter'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useExpensesByCategory } from '@/hooks/use-expenses'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartConfig = {
  totalAmount: {
    label: 'Total spent',
    theme: {
      light: 'var(--color-chart-2)',
      dark: 'var(--color-chart-2)',
    },
  },
}

const rangeLabels: Record<DateRange, string> = {
  month: 'Single month',
  quarter: 'Last 3 months',
  year: 'Last 12 months',
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export function ExpensesByCategoryChart() {
  const currentMonth = new Date().getMonth()
  const [range, setRange] = useState<DateRange>('month')
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth)

  const monthIndexForQuery = range === 'month' ? selectedMonth : undefined
  const { data, isLoading } = useExpensesByCategory(range, monthIndexForQuery)

  const handleRangeChange = (value: string) => {
    setRange(value as DateRange)
  }

  return (
    <Card className="md:col-span-2 lg:col-span-4">
      <CardHeader className="flex flex-col gap-2 space-y-0 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium sm:text-base">Expenses by category</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            General building expenses grouped by expense category.
          </CardDescription>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <Select value={range} onValueChange={handleRangeChange}>
            <SelectTrigger className="w-full sm:w-[160px]" aria-label="Time range for expense category chart">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(rangeLabels) as DateRange[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {rangeLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {range === 'month' ? (
            <DateRangeFilter onMonthChange={setSelectedMonth} defaultValue={selectedMonth} />
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[250px] items-center justify-center sm:h-[300px]">Loading...</div>
        ) : !data || data.categories.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground sm:h-[300px]">
            No expenses recorded in this period.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full sm:h-[300px]">
            <BarChart
              data={data.categories}
              layout="vertical"
              margin={{ left: 4, right: 16, top: 8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={110}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [formatCurrency(Number(value)), 'Total spent']}
                  />
                }
              />
              <Bar dataKey="totalAmount" fill="var(--color-totalAmount)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
