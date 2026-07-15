import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import clsx from 'clsx'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div
        className="animate-overlay-in absolute inset-0 bg-[rgba(14,15,34,0.5)]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={clsx(
          'animate-pop relative flex w-full flex-col overflow-hidden rounded-[18px] bg-white shadow-modal',
          'max-h-[90vh]',
          SIZES[size]
        )}
      >
        <div className="flex items-center justify-between border-b border-surface-200 px-[22px] py-5">
          <h2 id="modal-title" className="font-display text-[17px] text-surface-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-[7px] text-surface-400 hover:bg-surface-100 hover:text-surface-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <X className="h-[17px] w-[17px]" />
          </button>
        </div>
        <div className="overflow-y-auto px-[22px] py-5 scrollbar-thin">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2.5 border-t border-surface-200 px-[22px] py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}