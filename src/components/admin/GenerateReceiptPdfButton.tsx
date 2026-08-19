'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, toast, useDocumentInfo } from '@payloadcms/ui'
import { generateReceiptPdf } from '@/server/invoices'

export const GenerateReceiptPdfButton = () => {
  const { id } = useDocumentInfo()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!id) {
    return null
  }

  const handleClick = async () => {
    setLoading(true)
    const result = await generateReceiptPdf(String(id))
    setLoading(false)

    if (result.success) {
      toast.success('Receipt PDF generated')
      router.refresh()
      window.open(result.pdfUrl, '_blank')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Button el="button" buttonStyle="secondary" size="small" disabled={loading} onClick={handleClick}>
      {loading ? 'Generating…' : 'Generate Receipt'}
    </Button>
  )
}
