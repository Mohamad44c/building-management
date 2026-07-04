'use client'

import { useRentCollectionSummary } from '@/hooks/use-invoices'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Receipt, HandCoins, AlertTriangle, Percent } from 'lucide-react'

type Props = {
  startDate: string
  endDate: string
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export function RentCollectionSummaryCards({ startDate, endDate }: Props) {
  const { data, isLoading, isError } = useRentCollectionSummary(startDate, endDate)

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-32" />
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
          <CardTitle className="text-base font-medium">Rent collection unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground">
            We could not load rent collection data for this period.
          </p>
        </CardContent>
      </Card>
    )
  }

  const { totalBilled, totalCollected, outstanding, collectionRatePct, overdueCount, invoiceCount } =
    data

  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Billed</CardTitle>
          <Receipt className="size-4" />
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold">{formatCurrency(totalBilled)}</p>
          <CardDescription>
            {invoiceCount} invoice{invoiceCount === 1 ? '' : 's'} for this period
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Collected</CardTitle>
          <HandCoins className="size-4" />
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold">{formatCurrency(totalCollected)}</p>
          <CardDescription>
            {collectionRatePct !== null ? `${collectionRatePct.toFixed(1)}% of billed` : 'No invoices billed yet'}
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Outstanding</CardTitle>
          <Percent className="size-4" />
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold">{formatCurrency(outstanding)}</p>
          <CardDescription>Billed minus collected for this period</CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Overdue invoices</CardTitle>
          <AlertTriangle className="size-4" />
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold">{overdueCount}</p>
          <CardDescription>Past due date and not fully paid</CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
