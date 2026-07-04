'use client'

import { useReceivablesAging } from '@/hooks/use-invoices'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { AlertCircle } from 'lucide-react'

const chartConfig = {
  totalOwed: {
    label: 'Outstanding balance',
    theme: {
      light: 'var(--color-chart-5)',
      dark: 'var(--color-chart-5)',
    },
  },
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export function ReceivablesAgingChart() {
  const { data, isLoading, isError } = useReceivablesAging()

  return (
    <Card className="md:col-span-2 lg:col-span-5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium sm:text-base">Receivables aging</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Outstanding invoice balances by days past due date. Independent of the reporting period above.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[220px] items-center justify-center sm:h-[260px]">Loading...</div>
        ) : isError || !data ? (
          <div className="flex h-[220px] items-center justify-center gap-2 text-sm text-destructive sm:h-[260px]">
            <AlertCircle className="size-4" />
            Could not load receivables aging.
          </div>
        ) : data.totalOwed <= 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground sm:h-[260px]">
            No outstanding invoice balances.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[220px] w-full sm:h-[260px]">
            <BarChart data={data.buckets} margin={{ left: 4, right: 8, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="bucket"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(value) => `${value}d`}
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
                    formatter={(value) => [formatCurrency(Number(value)), 'Outstanding']}
                    labelFormatter={(label) => `${label} days past due`}
                  />
                }
              />
              <Bar dataKey="totalOwed" fill="var(--color-totalOwed)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
