'use client'

import { usePayments } from '@/hooks/use-payments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2 } from 'lucide-react'

export function PaymentsByBuildingChart() {
  const { data, isLoading, error } = usePayments()

  if (isLoading) {
    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Building Payments</CardTitle>
          <Building2 />
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
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Building Payments</CardTitle>
          <Building2 />
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading payments data</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.buildings.length === 0) {
    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Building Payments</CardTitle>
          <Building2 />
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
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Building Payments</CardTitle>
        <Building2 />
      </CardHeader>
      <CardContent className="space-y-4">
        {data.buildings.map((building, index) => (
          <div
            key={building.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">{index + 1}</span>
              </div>
              <div>
                <p className="font-medium">{building.name}</p>
                <p className="text-sm text-muted-foreground">Building {index + 1}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{formatCurrency(building.total)}</p>
            </div>
          </div>
        ))}

        {/* Total of all buildings */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">Σ</span>
              </div>
              <div>
                <p className="font-semibold">Total of All Buildings</p>
                <p className="text-sm text-muted-foreground">Combined total</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{formatCurrency(data.grandTotal)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
