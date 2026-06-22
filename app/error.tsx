'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Xəta baş verdi
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Bir şey səhv getdi. Xahiş edirik yenidən cəhd edin.
        </p>
        <Button onClick={reset}>
          Yenidən cəhd et
        </Button>
      </div>
    </div>
  )
}
