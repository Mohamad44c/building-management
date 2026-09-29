'use client'

import { Building2 } from 'lucide-react'

import { BarList } from '@/components/dashboard/bar-list'
import { Panel, type PanelStatus } from '@/components/dashboard/panel'
import type { PaymentsByBuilding } from '@/lib/dashboardMetrics'
import { formatCurrency } from '@/lib/format'

type Props = { data?: PaymentsByBuilding; status: PanelStatus; onRetry?: () => void; className?: string }

export function PaymentsByBuildingChart({ data, status, onRetry, className }: Props) {
  const empty = status === 'ready' && (data?.paymentCount ?? 0) === 0

  return (
    <Panel
      title="Payments received by building"
      description={
        data && data.paymentCount > 0 ? (
          <>
            <span className="font-semibold text-foreground">{formatCurrency(data.grandTotal)}</span> from{' '}
            {data.paymentCount} recorded payment{data.paymentCount === 1 ? '' : 's'} dated in this period.
          </>
        ) : (
          'Recorded payments dated in this period.'
        )
      }
      icon={Building2}
      status={empty ? 'empty' : status}
      onRetry={onRetry}
      emptyMessage="No payments recorded in this period."
      bodyClassName="min-h-[180px]"
      className={className}
    >
      <BarList
        items={(data?.buildings ?? []).map((b) => ({
          id: b.id,
          label: b.name,
          value: b.total,
          detail: `${b.count} payment${b.count === 1 ? '' : 's'}`,
          muted: b.id === 'unassigned',
        }))}
        format={formatCurrency}
      />
    </Panel>
  )
}
