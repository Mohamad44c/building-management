'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { useGeneratorHoursByDay } from '@/hooks/use-generator-hours'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

const chartConfig = {
  hoursRun: {
    label: 'Hours Run',
    theme: {
      light: 'oklch(0.6 0.118 184.704)',
      dark: 'oklch(0.696 0.17 162.48)',
    },
  },
}

export function GeneratorHoursByDayChart() {
  const currentMonth = new Date().getMonth()
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth)
  const { data: hours, isLoading } = useGeneratorHoursByDay(selectedMonth)

  const chartData = hours?.map((reading: any) => ({
    date: reading.date,
    hoursRun: reading.hoursRun,
    meterReading: reading.meterReading,
  }))

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Generator Hours by Day</CardTitle>
        <DateRangeFilter onMonthChange={setSelectedMonth} defaultValue={selectedMonth} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[350px] items-center justify-center">Loading...</div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="hoursRun" fill="var(--color-hoursRun)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
