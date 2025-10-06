'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangeFilter, type DateRange } from '@/components/ui/date-range-filter'
import { useExpenses } from '@/hooks/use-expenses'
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
import { Expense } from '@/payload-types'

export function ExpensesChart() {
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const { data: expenses, isLoading } = useExpenses(dateRange)

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
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Expenses Overview</CardTitle>
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
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#98bad5" name="Amount ($)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
