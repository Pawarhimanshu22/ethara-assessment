import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToastList } from '../../context/ToastContext'
import clsx from 'clsx'

const CONFIG = {
  success: { icon: CheckCircle2, chipFg: '#059669', chipBg: '#ecfdf5' },
  error: { icon: XCircle, chipFg: '#e11d48', chipBg: '#fff1f3' },
  info: { icon: Info, chipFg: '#4f46e5', chipBg: '#eef2ff' },
}

export default function ToastContainer() {
  const { toasts, remove } = useToastList()

  if (toasts.length === 0) return null

  return (
    <div className="fixed right-5 top-5 z-[100] flex w-80 flex-col gap-2.5">
      {toasts.map((t) => {
        const cfg = CONFIG[t.type] || CONFIG.info
        const Icon = cfg.icon
        return (
          <div
            key={t.id}
            role="alert"
            className={clsx(
              'animate-toast-in flex items-center gap-2.5 rounded-xl border border-surface-200 bg-white px-3.5 py-3 shadow-popover'
            )}
          >
            <span
              className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px]"
              style={{ backgroundColor: cfg.chipBg, color: cfg.chipFg }}
            >
              <Icon className="h-[14px] w-[14px]" />
            </span>
            <p className="flex-1 text-[13px] font-medium text-surface-900">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="text-surface-400 hover:text-surface-600"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}