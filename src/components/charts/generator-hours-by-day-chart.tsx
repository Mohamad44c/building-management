'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGeneratorDashboardStats } from '@/hooks/use-generator-dashboard-stats'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

const chartConfig = {
  hoursRun: {
    label: 'Hours Run',
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

const formatDateLabel = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export function GeneratorHoursByDayChart({ startDate, endDate }: Props) {
  const { data, isLoading, isError } = useGeneratorDashboardStats(startDate, endDate)
  const chartData = data?.timeline ?? []
  const hasEnoughData = chartData.length >= 2

  return (
    <Card className="md:col-span-2 lg:col-span-4">
      <CardHeader className="flex flex-col gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium sm:text-base">Generator Hours by Day</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[250px] items-center justify-center sm:h-[300px] lg:h-[350px]">
            Loading...
          </div>
        ) : isError ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground sm:h-[300px] lg:h-[350px]">
            Could not load generator timeline data for this period.
          </div>
        ) : !hasEnoughData ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground sm:h-[300px] lg:h-[350px]">
            Add at least two meter readings in this period to view the daily usage timeline.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[250px] w-full sm:h-[300px] lg:h-[350px]"
          >
            <LineChart data={chartData} margin={{ left: 4, right: 8, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={formatDateLabel}
              />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent labelFormatter={formatDateLabel} />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="hoursRun"
                stroke="var(--color-hoursRun)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--color-hoursRun)' }}
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
