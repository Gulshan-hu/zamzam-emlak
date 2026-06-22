import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Səhifə tapılmadı
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Axtardığınız səhifə mövcud deyil və ya köçürülüb.
        </p>
        <Link href="/">
          <Button>Ana səhifəyə qayıt</Button>
        </Link>
      </div>
    </div>
  )
}
