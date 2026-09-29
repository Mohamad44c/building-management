import configPromise from '@/payload.config'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { dayKey } from '@/lib/businessTime'
import { DEFAULT_DASHBOARD_FILTER } from '@/lib/dashboardDateFilter'
import { dashboardKeys } from '@/lib/dashboardQueryKeys'
import { getDashboardOverview, getDashboardPeriodData } from '@/server/dashboard'
import { HomeDashboard } from './components/home-dashboard'

export default async function HomePage() {
  // The middleware only checks that a payload-token cookie exists; verify it here.
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    redirect('/admin/login?redirect=/')
  }

  // Load the default view on the server, in parallel, so the page arrives with data instead of
  // kicking off client-side requests after hydration. Failures are left for the client to retry.
  const queryClient = new QueryClient()
  const today = dayKey(new Date())
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: dashboardKeys.period(DEFAULT_DASHBOARD_FILTER, today),
      queryFn: () => getDashboardPeriodData(DEFAULT_DASHBOARD_FILTER),
    }),
    queryClient.prefetchQuery({
      queryKey: dashboardKeys.overview(today),
      queryFn: () => getDashboardOverview(),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeDashboard />
    </HydrationBoundary>
  )
}
