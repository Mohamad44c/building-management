'use client'

import { useRentCollectionForecast } from '@/hooks/use-invoices'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp } from 'lucide-react'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export function CollectionForecastCard() {
  const { data, isLoading, isError } = useRentCollectionForecast()

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Next month collection forecast</CardTitle>
          <TrendingUp className="size-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !data || data.projectedNextMonth === null) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Next month collection forecast</CardTitle>
          <TrendingUp className="size-4" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Not enough completed billing months yet to project next month&apos;s collection.
          </p>
        </CardContent>
      </Card>
    )
  }

  const lastMonth = data.history[data.history.length - 1]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Next month collection forecast</CardTitle>
        <TrendingUp className="size-4" />
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-bold">{formatCurrency(data.projectedNextMonth)}</p>
        <CardDescription>
          Projected from a linear trend over the last {data.monthsUsed} completed month
          {data.monthsUsed === 1 ? '' : 's'}.
          {lastMonth ? ` Last completed month (${lastMonth.label}): ${formatCurrency(lastMonth.collected)} collected.` : ''}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
