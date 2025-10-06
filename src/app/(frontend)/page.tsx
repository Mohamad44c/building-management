import { ExpensesChart } from '@/components/charts/expenses-chart'
import { DieselExpensesChart } from '@/components/charts/diesel-expenses-chart'
import { DieselAmountChart } from '@/components/charts/diesel-amount-chart'
import { PaymentsByBuildingChart } from '@/components/charts/payments-by-building-chart'

export default function HomePage() {
  return (
    <div className="space-y-8 p-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Building Management Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Monitor expenses, diesel consumption, and payments across your building portfolio with
            comprehensive analytics and insights.
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <ExpensesChart />
        <DieselExpensesChart />
        <DieselAmountChart />
        <PaymentsByBuildingChart />
      </div>
    </div>
  )
}
