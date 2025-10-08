'use client'

import { useTenants } from '@/hooks/use-tenants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Building } from 'lucide-react'

export function TenantsByBuildingChart() {
  const { data, isLoading, error } = useTenants()

  if (isLoading) {
    return (
      <Card className="md:col-span-2 lg:col-span-5">
        <CardHeader>
          <CardTitle className="text-sm font-medium sm:text-base">
            Tenant Data by Building
          </CardTitle>
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
      <Card className="md:col-span-2 lg:col-span-5">
        <CardHeader>
          <CardTitle className="text-sm font-medium sm:text-base">
            Tenant Data by Building
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading tenant data</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.buildings.length === 0) {
    return (
      <Card className="md:col-span-2 lg:col-span-5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium sm:text-base">
            Tenant Data by Building
          </CardTitle>
          <Building />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No tenant data available</p>
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
    <Card className="md:col-span-2 lg:col-span-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium sm:text-base">Tenant Data by Building</CardTitle>
        <Building className="size-4" />
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {data.buildings.map((building, index) => (
          <div
            key={building.id}
            className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-chart-2/20">
                <span className="text-sm font-semibold text-chart-2">{index + 1}</span>
              </div>
              <div>
                <p className="text-sm font-medium sm:text-base">{building.name}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {building.tenantCount} tenant{building.tenantCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total Amps</p>
                  <p className="text-sm font-semibold">{building.totalAmps}A</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Monthly Fees</p>
                  <p className="text-sm font-semibold text-chart-1">
                    {formatCurrency(building.totalMonthlyFees)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Building Fees</p>
                  <p className="text-sm font-semibold text-chart-4">
                    {formatCurrency(building.totalBuildingFees)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Grand Totals */}
        <div className="mt-4 border-t pt-4">
          <div className="flex flex-col gap-3 rounded-lg border border-chart-2/20 bg-chart-2/10 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-chart-2">
                <span className="text-sm font-semibold text-white dark:text-background">Σ</span>
              </div>
              <div>
                <p className="text-sm font-semibold sm:text-base">Total of All Buildings</p>
                <p className="text-xs text-muted-foreground sm:text-sm">Combined totals</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total Amps</p>
                  <p className="text-sm font-bold">{data.grandTotalAmps}A</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Monthly Fees</p>
                  <p className="text-sm font-bold">{formatCurrency(data.grandTotalMonthlyFees)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Building Fees</p>
                  <p className="text-sm font-bold">{formatCurrency(data.grandTotalBuildingFees)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
