'use client'

import { useGeneratorMaintenanceForecast } from '@/hooks/use-expenses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Wrench } from 'lucide-react'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

export function GeneratorMaintenanceForecastCard() {
  const { data, isLoading, isError } = useGeneratorMaintenanceForecast()

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Next service estimate</CardTitle>
          <Wrench className="size-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !data || data.hoursRemaining === null) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Next service estimate</CardTitle>
          <Wrench className="size-4" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Not enough generator hours / oil-change records yet to estimate the next service.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Next service estimate</CardTitle>
        <Wrench className="size-4" />
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-bold">{data.hoursRemaining.toFixed(0)} h remaining</p>
        <p className="text-sm text-muted-foreground">
          {data.estimatedDueDate
            ? `Estimated due around ${formatDate(data.estimatedDueDate)}`
            : 'Not enough recent runtime data to estimate a due date'}
        </p>
        <CardDescription>
          Rough estimate based on a 250h service interval assumption — no service-interval field
          exists yet. {data.avgHoursPerDay ? `Avg. ${data.avgHoursPerDay.toFixed(1)} h/day recently.` : ''}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
