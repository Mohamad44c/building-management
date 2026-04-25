'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { useDieselExpenses } from '@/hooks/use-expenses'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { DieselExpense } from '@/payload-types'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartConfig = {
  amount: {
    label: 'Amount',
    theme: {
      light: 'var(--color-chart-1)',
      dark: 'var(--color-chart-1)',
    },
  },
}

export function DieselAmountChart() {
  const currentMonth = new Date().getMonth()
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth)
  const { data: expenses, isLoading } = useDieselExpenses(selectedMonth)

  const chartData = expenses?.map((expense: DieselExpense) => ({
    date: new Date(expense.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    amount: expense.totalAmount,
  }))

  // Calculate total amount for display
  const totalAmount = expenses?.reduce((sum, expense) => sum + (expense.totalAmount || 0), 0) || 0

  return (
    <Card className="md:col-span-2 lg:col-span-4">
      <CardHeader className="flex flex-col gap-2 space-y-0 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-sm font-medium sm:text-base">Diesel Expenses Amount</CardTitle>
        <DateRangeFilter onMonthChange={setSelectedMonth} defaultValue={selectedMonth} />
      </CardHeader>
      <CardContent>
        <div className="mb-3 sm:mb-4">
          <div className="text-xl font-bold sm:text-2xl">${totalAmount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total diesel expenses</p>
        </div>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center sm:h-[250px] lg:h-[300px]">
            Loading...
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[200px] w-full sm:h-[250px] lg:h-[300px]"
          >
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
