'use client'

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'
import { AlertCircle } from 'lucide-react'

import { Panel, SnapshotBadge, type PanelStatus } from '@/components/dashboard/panel'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import type { ReceivablesAging } from '@/lib/dashboardMetrics'
import { formatCurrency, formatCurrencyCompact } from '@/lib/format'

// Not-yet-due is neutral; anything overdue uses the "critical" red.
const chartConfig = {
  current: { label: 'Not yet due', theme: { light: '#a3a3a3', dark: '#737373' } },
  overdue: { label: 'Overdue', theme: { light: '#e34948', dark: '#e66767' } },
} satisfies ChartConfig

type Props = { data?: ReceivablesAging; status: PanelStatus; onRetry?: () => void; className?: string }

export function ReceivablesAgingChart({ data, status, onRetry, className }: Props) {
  const empty = status === 'ready' && (data?.totalOwed ?? 0) <= 0

  return (
    <Panel
      title="Receivables aging"
      description={
        data && data.totalOwed > 0 ? (
          <>
            <span className="font-semibold text-foreground">{formatCurrency(data.totalOwed)}</span> unpaid across all
            invoices, <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(data.overdueOwed)}</span>{' '}
            overdue.
          </>
        ) : (
          'Unpaid invoice balances by days past due.'
        )
      }
      icon={AlertCircle}
      badge={<SnapshotBadge>All periods</SnapshotBadge>}
      status={empty ? 'empty' : status}
      onRetry={onRetry}
      emptyMessage="No unpaid invoice balances. 🎉"
      bodyClassName="h-[240px] sm:h-[260px]"
      className={className}
    >
      <ChartContainer config={chartConfig} className="aspect-auto size-full">
        <BarChart data={data?.buckets ?? []} margin={{ left: 0, right: 4, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="bucket"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
            interval={0}
            tickFormatter={(bucket: string) => (bucket === 'current' ? 'Not due' : `${bucket}d`)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={48}
            tickFormatter={(v) => formatCurrencyCompact(Number(v))}
          />
          <ChartTooltip
            cursor={{ fillOpacity: 0.5 }}
            content={
              <ChartTooltipContent
                hideIndicator
                labelFormatter={(_, payload) => payload?.[0]?.payload?.label}
                formatter={(value, _name, item) => (
                  <div className="grid w-full gap-0.5">
                    <span className="font-mono font-medium tabular-nums">{formatCurrency(Number(value))}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.payload.invoiceCount} invoice{item.payload.invoiceCount === 1 ? '' : 's'}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Bar dataKey="totalOwed" radius={[4, 4, 0, 0]} maxBarSize={56}>
            {(data?.buckets ?? []).map((bucket) => (
              <Cell
                key={bucket.bucket}
                fill={bucket.bucket === 'current' ? 'var(--color-current)' : 'var(--color-overdue)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </Panel>
  )
}
