import configPromise from '@/payload.config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

// Verifies the request's Payload session. Kept out of the 'use server' files so
// it is not itself exposed as a callable server action.
export async function requireUser() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}
