'use client'

import { Wrench } from 'lucide-react'

import { StatCard } from '@/components/dashboard/stat-card'
import { Progress } from '@/components/ui/progress'
import { SERVICE_INTERVAL_HOURS, type GeneratorMaintenanceForecast } from '@/lib/dashboardMetrics'
import { formatDay, formatHours, formatInteger } from '@/lib/format'
import { cn } from '@/lib/utils'

export function GeneratorMaintenanceForecastCard({ data, loading }: { data?: GeneratorMaintenanceForecast; loading: boolean }) {
  if (!loading && data?.status !== 'ok') {
    return (
      <StatCard
        label="Next oil change"
        icon={Wrench}
        value="—"
        hint={data?.status === 'unavailable' ? data.reason : 'Unavailable.'}
      />
    )
  }

  const overdue = data?.status === 'ok' && data.hoursRemaining <= 0
  const usedPct = data?.status === 'ok' ? Math.min(100, (data.hoursSinceService / SERVICE_INTERVAL_HOURS) * 100) : 0

  return (
    <StatCard
      label="Next oil change"
      icon={Wrench}
      loading={loading}
      value={
        data?.status === 'ok' && (
          <span className={cn(overdue && 'text-red-600 dark:text-red-400')}>
            {overdue ? `Overdue ${formatHours(-data.hoursRemaining)}` : `${formatHours(data.hoursRemaining)} left`}
          </span>
        )
      }
      hint={
        data?.status === 'ok' &&
        `${formatInteger(data.hoursSinceService)} of ${SERVICE_INTERVAL_HOURS} h since the change on ${formatDay(data.lastServiceDate)}${
          data.estimatedDueDate ? ` · due around ${formatDay(data.estimatedDueDate)}` : ''
        }${data.avgHoursPerDay !== null ? ` · ~${data.avgHoursPerDay.toFixed(1)} h/day lately` : ''}.`
      }
      footer={
        <Progress
          value={usedPct}
          aria-label={`${usedPct.toFixed(0)}% of service interval used`}
          className={cn('mt-1 h-1.5', overdue && 'bg-red-500/20 [&>[data-slot=progress-indicator]]:bg-red-500')}
        />
      }
    />
  )
}
