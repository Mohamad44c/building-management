import type { DashboardDateFilterValue } from '@/lib/dashboardDateFilter'

// `today` is part of the key so presets like "This month" roll over at business midnight.
// Shared by the server prefetch (page.tsx) and the client hooks, so keep it free of 'use client'.
export const dashboardKeys = {
  period: (filter: DashboardDateFilterValue, today: string) => ['dashboard', 'period', filter, today] as const,
  overview: (today: string) => ['dashboard', 'overview', today] as const,
}
