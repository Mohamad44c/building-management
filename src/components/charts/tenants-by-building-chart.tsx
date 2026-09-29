'use client'

import { Users } from 'lucide-react'

import { Panel, SnapshotBadge, type PanelStatus } from '@/components/dashboard/panel'
import type { TenantsByBuilding } from '@/lib/dashboardMetrics'
import { formatCurrency, formatInteger } from '@/lib/format'

type Props = { data?: TenantsByBuilding; status: PanelStatus; onRetry?: () => void; className?: string }

export function TenantsByBuildingChart({ data, status, onRetry, className }: Props) {
  const empty = status === 'ready' && (data?.buildings.length ?? 0) === 0
  const totals = data?.totals

  return (
    <Panel
      title="Tenants by building"
      description={
        totals
          ? `Active tenants' current fees and amps.${totals.inactiveCount > 0 ? ` ${totals.inactiveCount} inactive tenant${totals.inactiveCount === 1 ? '' : 's'} not counted.` : ''}`
          : "Active tenants' current fees and amps."
      }
      icon={Users}
      badge={<SnapshotBadge />}
      status={empty ? 'empty' : status}
      onRetry={onRetry}
      emptyMessage="No buildings yet."
      bodyClassName="min-h-[160px]"
      className={className}
    >
      <div className="-mx-5 overflow-x-auto px-5">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2 pr-3 font-medium">Building</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Tenants</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Amps</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Monthly fees</th>
              <th scope="col" className="py-2 pl-3 text-right font-medium">Building fees</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {data?.buildings.map((b) => (
              <tr key={b.id} className="border-b border-border/60 last:border-0">
                <th scope="row" className="py-2.5 pr-3 text-left font-medium">{b.name}</th>
                <td className="px-3 py-2.5 text-right">
                  {b.tenantCount}
                  {b.inactiveCount > 0 ? (
                    <span className="ml-1 text-xs text-muted-foreground">(+{b.inactiveCount} inactive)</span>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-right">{formatInteger(b.totalAmps)} A</td>
                <td className="px-3 py-2.5 text-right">{formatCurrency(b.totalMonthlyFees)}</td>
                <td className="py-2.5 pl-3 text-right">{formatCurrency(b.totalBuildingFees)}</td>
              </tr>
            ))}
          </tbody>
          {totals ? (
            <tfoot className="tabular-nums">
              <tr className="border-t-2 font-semibold">
                <th scope="row" className="py-2.5 pr-3 text-left">Total</th>
                <td className="px-3 py-2.5 text-right">{totals.tenantCount}</td>
                <td className="px-3 py-2.5 text-right">{formatInteger(totals.totalAmps)} A</td>
                <td className="px-3 py-2.5 text-right">{formatCurrency(totals.totalMonthlyFees)}</td>
                <td className="py-2.5 pl-3 text-right">{formatCurrency(totals.totalBuildingFees)}</td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </Panel>
  )
}
