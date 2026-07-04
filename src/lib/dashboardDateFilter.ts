export type DashboardDateFilterPreset = 'this-month' | 'last-month' | 'last-3-months'

export type DashboardDateFilterValue =
  | { mode: 'preset'; preset: DashboardDateFilterPreset }
  | { mode: 'month'; monthIndex: number; year: number }

export type DashboardDateWindow = {
  start: Date
  end: Date
  label: string
}

const endOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)

const startOfMonth = (year: number, monthIndex: number): Date =>
  new Date(year, monthIndex, 1, 0, 0, 0, 0)

const endOfMonth = (year: number, monthIndex: number): Date =>
  new Date(year, monthIndex + 1, 0, 23, 59, 59, 999)

export function resolveDashboardDateWindow(value: DashboardDateFilterValue): DashboardDateWindow {
  const now = new Date()

  if (value.mode === 'month') {
    const start = startOfMonth(value.year, value.monthIndex)
    const end = endOfMonth(value.year, value.monthIndex)
    const label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    return { start, end, label }
  }

  switch (value.preset) {
    case 'this-month':
      return {
        start: startOfMonth(now.getFullYear(), now.getMonth()),
        end: endOfDay(now),
        label: 'This month',
      }
    case 'last-month': {
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return {
        start: startOfMonth(lastMonthDate.getFullYear(), lastMonthDate.getMonth()),
        end: endOfMonth(lastMonthDate.getFullYear(), lastMonthDate.getMonth()),
        label: 'Last month',
      }
    }
    case 'last-3-months': {
      const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      return {
        start: startOfMonth(startDate.getFullYear(), startDate.getMonth()),
        end: endOfDay(now),
        label: 'Last 3 months',
      }
    }
  }
}
