'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Timer } from 'lucide-react'

import { Panel, type PanelStatus } from '@/components/dashboard/panel'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import type { DailyHoursPoint } from '@/lib/generatorStats'
import { formatDay, formatHours } from '@/lib/format'

const chartConfig = {
  hoursRun: { label: 'Hours run', theme: { light: '#2a78d6', dark: '#3987e5' } },
} satisfies ChartConfig

type Props = { data?: DailyHoursPoint[]; status: PanelStatus; onRetry?: () => void; className?: string }

export function GeneratorHoursByDayChart({ data = [], status, onRetry, className }: Props) {
  return (
    <Panel
      title="Generator hours by day"
      description="Hours since the previous meter reading, on the day each reading was taken."
      icon={Timer}
      status={status}
      onRetry={onRetry}
      emptyMessage="No meter readings in this period."
      bodyClassName="h-[240px] sm:h-[280px]"
      className={className}
    >
      <ChartContainer config={chartConfig} className="aspect-auto size-full">
        <BarChart data={data} margin={{ left: 0, right: 4, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={16}
            fontSize={12}
            tickFormatter={(value) => formatDay(value)}
          />
          <YAxis tickLine={false} axisLine={false} fontSize={12} width={36} allowDecimals={false} />
          <ChartTooltip
            cursor={{ fillOpacity: 0.5 }}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => formatDay(payload?.[0]?.payload?.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                formatter={(value) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground">Hours run</span>
                    <span className="font-mono font-medium tabular-nums">{formatHours(Number(value))}</span>
                  </div>
                )}
              />
            }
          />
          <Bar dataKey="hoursRun" fill="var(--color-hoursRun)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ChartContainer>
    </Panel>
  )
}
