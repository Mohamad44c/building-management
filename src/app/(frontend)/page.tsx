import { ExpensesChart } from '@/components/charts/expenses-chart'
import { DieselExpensesChart } from '@/components/charts/diesel-expenses-chart'

export default function HomePage() {
  return (
    <div className="space-y-8 p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <ExpensesChart />
        <DieselExpensesChart />
      </div>
    </div>
  )
}
