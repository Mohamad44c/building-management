'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangeFilter, type DateRange } from '@/components/ui/date-range-filter'
import { useGeneratorExpensesByCategory } from '@/hooks/use-expenses'
import { useMemo, useState } from 'react'
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

function formatCategoryLabel(value: string) {
  if (!value) return ''
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function GeneratorExpensesByCategoryChart() {
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const { data, isLoading } = useGeneratorExpensesByCategory(dateRange)

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
        <DateRangeFilter onRangeChange={setDateRange} defaultValue={dateRange} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[350px] items-center justify-center">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalAmount" fill="#f59e0b" name="Total Amount ($)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

