'use client'

import { Button } from '@payloadcms/ui'

export const OpenDashboardButton = () => (
  <Button
    el="link"
    to="/"
    buttonStyle="secondary"
    size="small"
    aria-label="Open building management dashboard"
  >
    View Dashboard
  </Button>
)
