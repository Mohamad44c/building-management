'use client'

import { usePayments } from '@/hooks/use-payments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2 } from 'lucide-react'

export function PaymentsByBuildingChart() {
  const { data, isLoading, error } = usePayments()

  if (isLoading) {
    return (
      <Card className="md:col-span-1 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium sm:text-base">Building Payments</CardTitle>
          <Building2 className="size-4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="md:col-span-1 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium sm:text-base">Building Payments</CardTitle>
          <Building2 className="size-4" />
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading payments data</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.buildings.length === 0) {
    return (
      <Card className="md:col-span-1 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium sm:text-base">Building Payments</CardTitle>
          <Building2 className="size-4" />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No payment data available</p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <Card className="md:col-span-1 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium sm:text-base">Building Payments</CardTitle>
        <Building2 className="size-4" />
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {data.buildings.map((building, index) => (
          <div
            key={building.id}
            className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
          >
            <div className="flex items-center space-x-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                <span className="text-sm font-semibold text-primary">{index + 1}</span>
              </div>
              <div>
                <p className="text-sm font-medium sm:text-base">{building.name}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">Building {index + 1}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-semibold sm:text-lg">{formatCurrency(building.total)}</p>
            </div>
          </div>
        ))}

        {/* Total of all buildings */}
        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 dark:bg-primary/10">
            <div className="flex items-center space-x-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary">
                <span className="text-sm font-semibold text-primary-foreground">Σ</span>
              </div>
              <div>
                <p className="text-sm font-semibold sm:text-base">Total of All Buildings</p>
                <p className="text-xs text-muted-foreground sm:text-sm">Combined total</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold sm:text-xl">{formatCurrency(data.grandTotal)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
