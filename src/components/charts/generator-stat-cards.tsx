'use client'

import type { DashboardPeriod } from '@/lib/generatorStats'
import { useGeneratorDashboardStats } from '@/hooks/use-generator-dashboard-stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Fuel, Gauge, ReceiptText, Timer, CalendarDays } from 'lucide-react'

type Props = {
  period: DashboardPeriod
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const formatHours = (value: number) => `${value.toFixed(1)} h`

const renderComparison = (current: number, previous: number, formatter: (value: number) => string) => {
  if (previous <= 0) {
    return <p className="text-xs text-muted-foreground">No previous period data</p>
  }

  const delta = current - previous
  const percent = (delta / previous) * 100
  const trendClass = delta > 0 ? 'text-destructive' : delta < 0 ? 'text-emerald-600' : 'text-muted-foreground'

  return (
    <p className={`text-xs ${trendClass}`}>
      {delta >= 0 ? '+' : '-'}
      {formatter(Math.abs(delta))} ({delta >= 0 ? '+' : '-'}
      {Math.abs(percent).toFixed(1)}%) vs previous period
    </p>
  )
}

export function GeneratorStatCards({ period }: Props) {
  const { data, isLoading, isError } = useGeneratorDashboardStats(period)

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Preparing stats</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Generator stats unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We could not load generator stats for this period. Try another range.
          </p>
        </CardContent>
      </Card>
    )
  }

  const { current, previous } = data

  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Diesel spend</CardTitle>
          <Fuel className="size-4" />
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold">{formatCurrency(current.dieselSpent)}</p>
          {renderComparison(current.dieselSpent, previous.dieselSpent, formatCurrency)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Diesel received</CardTitle>
          <Gauge className="size-4" />
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold">{current.dieselLiters.toFixed(1)} L</p>
          <p className="text-xs text-muted-foreground">{current.dieselTons.toFixed(3)} tons</p>
          {renderComparison(current.dieselLiters, previous.dieselLiters, (value) => `${value.toFixed(1)} L`)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Generator runtime</CardTitle>
          <Timer className="size-4" />
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold">{formatHours(current.generatorHours)}</p>
          <p className="text-xs text-muted-foreground">{current.activeDays} active day(s)</p>
          {renderComparison(current.generatorHours, previous.generatorHours, formatHours)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total generator expenses</CardTitle>
          <ReceiptText className="size-4" />
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold">{formatCurrency(current.totalGeneratorExpenses)}</p>
          <p className="text-xs text-muted-foreground">
            Diesel + maintenance ({formatCurrency(current.maintenanceCost)} maintenance)
          </p>
          {renderComparison(
            current.totalGeneratorExpenses,
            previous.totalGeneratorExpenses,
            formatCurrency,
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Cost efficiency</CardTitle>
          <CalendarDays className="size-4" />
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm font-semibold">
            Per day:{' '}
            {current.costPerDay !== null ? formatCurrency(current.costPerDay) : 'Not enough day data'}
          </p>
          <p className="text-sm font-semibold">
            Per hour:{' '}
            {current.costPerHour !== null ? formatCurrency(current.costPerHour) : 'Not enough hour data'}
          </p>
          <p className="text-xs text-muted-foreground">
            Derived from total expense and runtime in selected period.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
