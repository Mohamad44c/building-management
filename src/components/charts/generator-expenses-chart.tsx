'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangeFilter, type DateRange } from '@/components/ui/date-range-filter'
import { useGeneratorExpenses } from '@/hooks/use-expenses'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { GeneratorExpense } from '@/payload-types'

export function GeneratorExpensesChart() {
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const { data: expenses, isLoading } = useGeneratorExpenses(dateRange)

  const chartData = expenses?.map((expense: GeneratorExpense) => ({
    date: new Date(expense.date).toLocaleDateString(),
    totalAmount: expense.totalAmount,
    liters: expense.liters,
  }))

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Generator Expenses Overview</CardTitle>
        <DateRangeFilter onRangeChange={setDateRange} defaultValue={dateRange} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[350px] items-center justify-center">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="totalAmount" fill="#8884d8" name="Total Amount ($)" />
              <Bar yAxisId="right" dataKey="liters" fill="#82ca9d" name="Diesel (Liters)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
