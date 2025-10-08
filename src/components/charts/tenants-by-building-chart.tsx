'use client'

import { useTenants } from '@/hooks/use-tenants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Building } from 'lucide-react'

export function TenantsByBuildingChart() {
  const { data, isLoading, error } = useTenants()

  if (isLoading) {
    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-5">
        <CardHeader>
          <CardTitle>Tenant Data by Building</CardTitle>
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
      <Card className="col-span-1 md:col-span-2 lg:col-span-5">
        <CardHeader>
          <CardTitle>Tenant Data by Building</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading tenant data</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.buildings.length === 0) {
    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Tenant Data by Building</CardTitle>
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
    <Card className="col-span-1 md:col-span-2 lg:col-span-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Tenant Data by Building</CardTitle>
        <Building />
      </CardHeader>
      <CardContent className="space-y-4">
        {data.buildings.map((building, index) => (
          <div
            key={building.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-chart-2/20 rounded-full flex items-center justify-center">
                <span className="text-chart-2 font-semibold text-sm">{index + 1}</span>
              </div>
              <div>
                <p className="font-medium">{building.name}</p>
                <p className="text-sm text-muted-foreground">
                  {building.tenantCount} tenant{building.tenantCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center space-x-4">
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
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between p-3 bg-chart-2/10 rounded-lg border border-chart-2/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-chart-2 rounded-full flex items-center justify-center">
                <span className="text-white dark:text-background font-semibold text-sm">Σ</span>
              </div>
              <div>
                <p className="font-semibold">Total of All Buildings</p>
                <p className="text-sm text-muted-foreground">Combined totals</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center space-x-4">
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
