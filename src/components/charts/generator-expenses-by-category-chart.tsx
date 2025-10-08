'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { useGeneratorExpensesByCategory } from '@/hooks/use-expenses'
import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

const chartConfig = {
  totalAmount: {
    label: 'Total Amount ($)',
    theme: {
      light: 'oklch(0.488 0.243 264.376)',
      dark: 'oklch(0.488 0.243 264.376)',
    },
  },
}

const formatCategoryLabel = (value: string) => {
  if (!value) return ''
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function GeneratorExpensesByCategoryChart() {
  const currentMonth = new Date().getMonth()
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth)
  const { data, isLoading } = useGeneratorExpensesByCategory(selectedMonth)

  const chartData = useMemo(() => {
    const categories = data?.categories ?? []
    return categories.map((c: any) => ({
      category: formatCategoryLabel(String(c.category)),
      totalAmount: Number(c.totalAmount) || 0,
      count: Number(c.count) || 0,
    }))
  }, [data])

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Generator Expenses by Category</CardTitle>
        <DateRangeFilter onMonthChange={setSelectedMonth} defaultValue={selectedMonth} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[350px] items-center justify-center">Loading...</div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="totalAmount" fill="var(--color-totalAmount)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
