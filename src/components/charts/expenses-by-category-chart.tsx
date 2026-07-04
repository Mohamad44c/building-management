'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useExpensesByCategory } from '@/hooks/use-expenses'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
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

type Props = {
  startDate: string
  endDate: string
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export function ExpensesByCategoryChart({ startDate, endDate }: Props) {
  const { data, isLoading } = useExpensesByCategory(startDate, endDate)

  return (
    <Card className="md:col-span-2 lg:col-span-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium sm:text-base">Expenses by category</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          General building expenses grouped by expense category.
        </CardDescription>
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
            <LineChart data={data.categories} margin={{ left: 4, right: 16, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                interval="preserveStartEnd"
                angle={data.categories.length > 6 ? -35 : 0}
                textAnchor={data.categories.length > 6 ? 'end' : 'middle'}
                height={data.categories.length > 6 ? 56 : 32}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
                width={56}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [formatCurrency(Number(value)), 'Total spent']}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="totalAmount"
                stroke="var(--color-totalAmount)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--color-totalAmount)' }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
