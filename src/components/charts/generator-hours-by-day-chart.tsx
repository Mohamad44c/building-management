'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGeneratorDashboardStats } from '@/hooks/use-generator-dashboard-stats'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import type { DashboardPeriod } from '@/lib/generatorStats'

const chartConfig = {
  hoursRun: {
    label: 'Hours Run',
    theme: {
      light: 'oklch(0.6 0.118 184.704)',
      dark: 'oklch(0.696 0.17 162.48)',
    },
  },
}

type Props = {
  period: DashboardPeriod
}

export function GeneratorHoursByDayChart({ period }: Props) {
  const { data, isLoading, isError } = useGeneratorDashboardStats(period)
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
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="hoursRun" fill="var(--color-hoursRun)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
