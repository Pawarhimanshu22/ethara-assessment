import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import Button from '../components/common/Button'
import { useAuth } from '../context/AuthContext'

const ROLE_LABELS = {
  admin: 'Admin',
  hr: 'HR',
  employee: 'Employee',
}

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const { role } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">

      <div className="w-full max-w-lg rounded-xl border border-surface-200 bg-white p-8 text-center shadow-card">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-2xl font-semibold text-surface-900">
          Access Denied
        </h1>

        <p className="mt-3 text-sm leading-6 text-surface-500">
          You don't have permission to access this page.
        </p>

        {role && (
          <div className="mt-5 rounded-lg bg-surface-50 p-4">

            <p className="text-xs uppercase tracking-wide text-surface-400">
              Signed in as
            </p>

            <p className="mt-1 font-semibold text-brand-600">
              {ROLE_LABELS[role] || role}
            </p>

          </div>
        )}

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