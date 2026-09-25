import configPromise from '@/payload.config'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { HomeDashboard } from './components/home-dashboard'

export default async function HomePage() {
  // The middleware only checks that a payload-token cookie exists; verify it here.
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    redirect('/admin/login?redirect=/')
  }

  return <HomeDashboard />
}
