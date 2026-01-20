'use client'

import React from 'react'

export const IsPaidCell: React.FC<{ cellData?: boolean }> = ({ cellData }) => {
  return <span>{cellData ? 'Yes' : 'No'}</span>
}
