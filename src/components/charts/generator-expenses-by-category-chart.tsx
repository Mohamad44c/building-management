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
      light: 'var(--color-chart-1)',
      dark: 'var(--color-chart-1)',
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
    <Card className="md:col-span-2 lg:col-span-4">
      <CardHeader className="flex flex-col gap-2 space-y-0 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-sm font-medium sm:text-base">
          Generator Expenses by Category
        </CardTitle>
        <DateRangeFilter onMonthChange={setSelectedMonth} defaultValue={selectedMonth} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[250px] items-center justify-center sm:h-[300px] lg:h-[350px]">
            Loading...
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[250px] w-full sm:h-[300px] lg:h-[350px]"
          >
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
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
