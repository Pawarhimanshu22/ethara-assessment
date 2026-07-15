import { SearchX, ArrowLeft, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import Button from '../components/common/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">

      <div className="w-full max-w-lg rounded-xl border border-surface-200 bg-white p-8 text-center shadow-card">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
          <SearchX className="h-10 w-10 text-brand-600" />
        </div>

        <p className="text-5xl font-bold tracking-tight text-brand-600">
          404
        </p>

        <h1 className="mt-3 text-2xl font-semibold text-surface-900">
          Page Not Found
        </h1>

        <p className="mt-3 text-sm leading-6 text-surface-500">
          The page you're looking for doesn't exist or may have been moved.
          Please check the URL or return to the dashboard.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>

          <Button
            icon={Home}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>

        </div>

      </div>

    </div>
  )
}