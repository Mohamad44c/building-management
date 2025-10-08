'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { useDieselExpenses } from '@/hooks/use-expenses'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { DieselExpense } from '@/payload-types'
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
  liters: {
    label: 'Diesel (Thousand Liters)',
    theme: {
      light: 'oklch(0.6 0.118 184.704)',
      dark: 'oklch(0.696 0.17 162.48)',
    },
  },
}

export function DieselExpensesChart() {
  const currentMonth = new Date().getMonth()
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth)
  const { data: expenses, isLoading } = useDieselExpenses(selectedMonth)

  const chartData = expenses?.map((expense: DieselExpense) => ({
    date: new Date(expense.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    totalAmount: expense.totalAmount,
    liters: expense.liters,
  }))

  return (
    <Card className="md:col-span-2 lg:col-span-4">
      <CardHeader className="flex flex-col gap-2 space-y-0 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-sm font-medium sm:text-base">Diesel Expenses Overview</CardTitle>
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
              <YAxis
                yAxisId="left"
                orientation="left"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                yAxisId="left"
                dataKey="totalAmount"
                fill="var(--color-totalAmount)"
                radius={4}
              />
              <Bar yAxisId="right" dataKey="liters" fill="var(--color-liters)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
