import clsx from 'clsx'

export default function LoadingSpinner({ size = 'md', label = 'Loading...', className }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' }

  return (
    <div className={clsx('flex flex-col items-center justify-center gap-2 py-10', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full border-2 border-brand-600 border-t-transparent',
          sizes[size]
        )}
        role="status"
        aria-label={label}
      />
      {label && <span className="text-sm text-surface-500">{label}</span>}
    </div>
  )
}