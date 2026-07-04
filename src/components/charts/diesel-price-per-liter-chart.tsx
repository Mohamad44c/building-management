'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDieselExpensesInRange } from '@/hooks/use-expenses'
import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { DieselExpense } from '@/payload-types'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartConfig = {
  pricePerLiter: {
    label: 'Price per liter',
    theme: {
      light: 'var(--color-chart-3)',
      dark: 'var(--color-chart-3)',
    },
  },
}

type Props = {
  startDate: string
  endDate: string
}

const getPricePerLiterUsd = (expense: DieselExpense): number => {
  const fromField = Number(expense.pricePerLiter)
  if (Number.isFinite(fromField) && fromField > 0) {
    return Math.round(fromField * 10000) / 10000
  }
  const perThousand = Number(expense.pricePerThousandLiters)
  if (Number.isFinite(perThousand) && perThousand > 0) {
    return Math.round((perThousand / 1000) * 10000) / 10000
  }
  return 0
}

export function DieselPricePerLiterChart({ startDate, endDate }: Props) {
  const { data: expenses, isLoading } = useDieselExpensesInRange(startDate, endDate)

  const chartData = useMemo(() => {
    if (!expenses?.length) {
      return []
    }
    return [...expenses]
      .map((expense) => {
        const d = new Date(expense.date)
        return {
          sortKey: d.getTime(),
          dateLabel: d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          pricePerLiter: getPricePerLiterUsd(expense),
        }
      })
      .filter((row) => row.pricePerLiter > 0)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ dateLabel, pricePerLiter }) => ({ dateLabel, pricePerLiter }))
  }, [expenses])

  return (
    <Card className="md:col-span-2 lg:col-span-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium sm:text-base">
          Diesel price per liter over time
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Effective unit price from each delivery (from stored price per liter or price per 1000 L).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[250px] items-center justify-center sm:h-[300px] lg:h-[320px]">
            Loading...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground sm:h-[300px] lg:h-[320px]">
            No diesel purchases in this period.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[250px] w-full sm:h-[300px] lg:h-[320px]"
          >
            <LineChart data={chartData} margin={{ left: 4, right: 8, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="dateLabel"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                interval="preserveStartEnd"
                angle={chartData.length > 8 ? -35 : 0}
                textAnchor={chartData.length > 8 ? 'end' : 'middle'}
                height={chartData.length > 8 ? 56 : 32}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                domain={['auto', 'auto']}
                width={56}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [
                      `$${Number(value).toFixed(4)} / L`,
                      'Price per liter',
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="pricePerLiter"
                stroke="var(--color-pricePerLiter)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--color-pricePerLiter)' }}
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
