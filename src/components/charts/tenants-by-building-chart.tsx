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
          <CardTitle className="text-base font-semibold sm:text-lg">
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
          <CardTitle className="text-base font-semibold sm:text-lg">
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
          <CardTitle className="text-base font-semibold sm:text-lg">
            Tenant Data by Building
          </CardTitle>
          <Building className="size-5 text-chart-2" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground sm:text-base">No tenant data available</p>
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
        <CardTitle className="text-base font-semibold sm:text-lg">Tenant Data by Building</CardTitle>
        <Building className="size-5 text-chart-2" />
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {data.buildings.map((building, index) => (
          <div
            key={building.id}
            className="flex flex-col gap-3 rounded-lg bg-muted/60 p-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-chart-2/25">
                <span className="text-base font-bold text-chart-2">{index + 1}</span>
              </div>
              <div>
                <p className="text-base font-semibold text-foreground sm:text-lg">{building.name}</p>
                <p className="text-sm text-muted-foreground">
                  {building.tenantCount} tenant{building.tenantCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Amps</p>
                  <p className="text-base font-bold text-chart-2 sm:text-lg">{building.totalAmps}A</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Monthly Fees</p>
                  <p className="text-base font-bold text-chart-1 sm:text-lg">
                    {formatCurrency(building.totalMonthlyFees)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Building Fees</p>
                  <p className="text-base font-bold text-chart-4 sm:text-lg">
                    {formatCurrency(building.totalBuildingFees)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Grand Totals */}
        <div className="mt-4 border-t pt-4">
          <div className="flex flex-col gap-3 rounded-lg border border-chart-2/30 bg-chart-2/15 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-chart-2">
                <span className="text-base font-bold text-white dark:text-background">Σ</span>
              </div>
              <div>
                <p className="text-base font-bold text-foreground sm:text-lg">Total of All Buildings</p>
                <p className="text-sm text-muted-foreground">Combined totals</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Amps</p>
                  <p className="text-base font-extrabold text-chart-2 sm:text-lg">{data.grandTotalAmps}A</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Monthly Fees</p>
                  <p className="text-base font-extrabold text-chart-1 sm:text-lg">
                    {formatCurrency(data.grandTotalMonthlyFees)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Building Fees</p>
                  <p className="text-base font-extrabold text-chart-4 sm:text-lg">
                    {formatCurrency(data.grandTotalBuildingFees)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
