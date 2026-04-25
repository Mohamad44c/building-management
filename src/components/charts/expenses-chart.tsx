'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { useExpenses } from '@/hooks/use-expenses'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Expense } from '@/payload-types'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

const chartConfig = {
  amount: {
    label: 'Amount ($)',
    theme: {
      light: 'var(--color-chart-1)',
      dark: 'var(--color-chart-1)',
    },
  },
}

export function ExpensesChart() {
  const currentMonth = new Date().getMonth()
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth)
  const { data: expenses, isLoading } = useExpenses(selectedMonth)

  const chartData = expenses?.map((expense: Expense) => ({
    date: new Date(expense.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    amount: expense.amount,
    category: expense.category,
  }))

  return (
    <Card className="md:col-span-2 lg:col-span-4">
      <CardHeader className="flex flex-col gap-2 space-y-0 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-sm font-medium sm:text-base">Expenses Overview</CardTitle>
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
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
