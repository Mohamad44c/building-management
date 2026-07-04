'use client'

import { useDieselPriceForecast } from '@/hooks/use-expenses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Minus, Fuel } from 'lucide-react'

const formatPrice = (value: number) => `$${value.toFixed(4)} / L`

const trendMeta = {
  up: { label: 'Rising', Icon: TrendingUp, variant: 'destructive' as const },
  down: { label: 'Falling', Icon: TrendingDown, variant: 'default' as const },
  flat: { label: 'Stable', Icon: Minus, variant: 'secondary' as const },
}

export function DieselPriceForecastCard() {
  const { data, isLoading, isError } = useDieselPriceForecast()

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Diesel price trend</CardTitle>
          <Fuel className="size-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !data || data.projectedNextPrice === null || data.trend === null) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Diesel price trend</CardTitle>
          <Fuel className="size-4" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Not enough diesel deliveries yet to project a price trend.
          </p>
        </CardContent>
      </Card>
    )
  }

  const meta = trendMeta[data.trend]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Diesel price trend</CardTitle>
        <Fuel className="size-4" />
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-bold">{formatPrice(data.projectedNextPrice)}</p>
        <Badge variant={meta.variant} className="gap-1">
          <meta.Icon className="size-3" />
          {meta.label}
        </Badge>
        <CardDescription>
          Projected next delivery price, from a linear trend over the last {data.pointsUsed}{' '}
          deliveries. Last actual price: {data.lastPrice !== null ? formatPrice(data.lastPrice) : 'n/a'}.
        </CardDescription>
      </CardContent>
    </Card>
  )
}
