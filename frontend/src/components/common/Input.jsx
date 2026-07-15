import clsx from 'clsx'

export default function Input({
  label,
  error,
  hint,
  required = false,
  className,
  id,
  leftIcon: LeftIcon,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-surface-500">
          {label}
          {required && <span className="text-[#e11d48]"> *</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <LeftIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        )}
        <input
          id={inputId}
          className={clsx(
            'h-[42px] w-full rounded-[11px] border bg-[#fbfbfd] text-sm text-surface-900 placeholder:text-surface-400',
            LeftIcon ? 'pl-9 pr-3' : 'px-[13px]',
            'focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-brand-600/[0.14]',
            'disabled:bg-surface-100 disabled:text-surface-400',
            error ? 'border-[#e11d48]' : 'border-surface-200'
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-[#e11d48]">
          {error}
        </p>
      )}
      {!error && hint && <p className="mt-1 text-xs text-surface-500">{hint}</p>}
    </div>
  )
}