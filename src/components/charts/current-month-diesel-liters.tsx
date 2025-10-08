'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentMonthDieselLiters, getCurrentMonthDieselExpenses } from '@/server/expenses'
import { Fuel } from 'lucide-react'
import { useEffect, useState } from 'react'

export function CurrentMonthDieselLiters() {
  const [totalLiters, setTotalLiters] = useState<number>(0)
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDieselData = async () => {
      try {
        const [liters, amount] = await Promise.all([
          getCurrentMonthDieselLiters(),
          getCurrentMonthDieselExpenses(),
        ])
        setTotalLiters(liters)
        setTotalAmount(amount)
      } catch (error) {
        console.error('Error fetching diesel data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDieselData()
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
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold">{totalLiters.toFixed(1)} L</div>
            <p className="text-xs text-muted-foreground">Total liters consumed</p>
          </div>
          <div>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total amount spent</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
