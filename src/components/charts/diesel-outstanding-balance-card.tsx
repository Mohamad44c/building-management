'use client'

import { useDieselOutstandingSummary } from '@/hooks/use-expenses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Banknote } from 'lucide-react'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export function DieselOutstandingBalanceCard() {
  const { data, isLoading, isError } = useDieselOutstandingSummary()

  if (isLoading) {
    return (
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium sm:text-base">Diesel supplier balance</CardTitle>
          <Banknote className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium sm:text-base">Diesel supplier balance</CardTitle>
          <Banknote className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Could not load diesel balance.</p>
        </CardContent>
      </Card>
    )
  }

  const { totalOwed, unpaidInvoiceCount } = data
  const isSettled = totalOwed <= 0

  return (
    <Card className="md:col-span-2 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium sm:text-base">Diesel supplier balance</CardTitle>
        <Banknote className="size-4 text-muted-foreground" aria-hidden />
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-bold tabular-nums" aria-live="polite">
          {isSettled ? formatCurrency(0) : formatCurrency(totalOwed)}
        </p>
        <CardDescription>
          {isSettled
            ? 'Nothing owed on diesel invoices (fully settled).'
            : `Invoices with a balance: ${unpaidInvoiceCount}. Each line is total invoice minus amount paid (partial payments included).`}
        </CardDescription>
      </CardContent>
    </Card>
  )
}
