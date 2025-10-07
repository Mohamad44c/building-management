'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentMonthDieselLiters } from '@/server/expenses'
import { Fuel } from 'lucide-react'
import { useEffect, useState } from 'react'

export function CurrentMonthDieselLiters() {
  const [totalLiters, setTotalLiters] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDieselLiters = async () => {
      try {
        const liters = await getCurrentMonthDieselLiters()
        setTotalLiters(liters)
      } catch (error) {
        console.error('Error fetching diesel liters:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDieselLiters()
  }, [])

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Current Month Diesel</CardTitle>
          <Fuel className="size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Current Month Diesel</CardTitle>
        <Fuel className="size-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalLiters.toFixed(1)} L</div>
        <p className="text-xs text-muted-foreground">Total liters consumed this month</p>
      </CardContent>
    </Card>
  )
}
