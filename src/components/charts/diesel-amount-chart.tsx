'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { useDieselExpenses } from '@/hooks/use-expenses'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DieselExpense } from '@/payload-types'

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
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Diesel Expenses Amount</CardTitle>
        <DateRangeFilter onMonthChange={setSelectedMonth} defaultValue={selectedMonth} />
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total diesel expenses</p>
        </div>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="amount" fill="#1192e8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
