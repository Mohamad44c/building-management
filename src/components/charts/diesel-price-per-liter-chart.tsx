'use client'

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { Fuel } from 'lucide-react'

import { Panel, type PanelStatus } from '@/components/dashboard/panel'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { formatDay, formatPricePerLiter } from '@/lib/format'

const chartConfig = {
  pricePerLiter: { label: 'Price per liter', theme: { light: '#eb6834', dark: '#d95926' } },
} satisfies ChartConfig

type Props = {
  data?: Array<{ date: string; pricePerLiter: number }>
  status: PanelStatus
  onRetry?: () => void
  className?: string
}

export function DieselPricePerLiterChart({ data = [], status, onRetry, className }: Props) {
  const withLabels = data.map((row, index) => ({ ...row, key: `${index}` }))

  return (
    <Panel
      title="Diesel price per liter"
      description="Unit price of each delivery in the period."
      icon={Fuel}
      status={status}
      onRetry={onRetry}
      emptyMessage="No priced diesel deliveries in this period."
      bodyClassName="h-[240px] sm:h-[280px]"
      className={className}
    >
      <ChartContainer config={chartConfig} className="aspect-auto size-full">
        <LineChart data={withLabels} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          {/* Deliveries can share a day, so the axis is keyed by index and labeled by date. */}
          <XAxis
            dataKey="key"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={16}
            fontSize={12}
            tickFormatter={(key) => formatDay(withLabels[Number(key)]?.date ?? '')}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={52}
            // Pad around the data but never below $0 (a lone point would otherwise get a -$1 axis).
            domain={[
              (min: number) => Math.max(0, Math.floor(min * 0.95 * 20) / 20),
              (max: number) => Math.ceil(max * 1.05 * 20) / 20,
            ]}
            tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(_, payload) => formatDay(payload?.[0]?.payload?.date, { month: 'short', day: 'numeric', year: 'numeric' })}
                formatter={(value) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-mono font-medium tabular-nums">{formatPricePerLiter(Number(value))}</span>
                  </div>
                )}
              />
            }
          />
          <Line
            type="linear"
            dataKey="pricePerLiter"
            stroke="var(--color-pricePerLiter)"
            strokeWidth={2}
            dot={{ r: 4, fill: 'var(--color-pricePerLiter)', stroke: 'var(--card)', strokeWidth: 2 }}
            activeDot={{ r: 6, stroke: 'var(--card)', strokeWidth: 2 }}
          />
        </LineChart>
      </ChartContainer>
    </Panel>
  )
}
