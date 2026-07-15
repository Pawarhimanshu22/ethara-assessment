import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'

export default function Select({
  label,
  error,
  required = false,
  options = [],
  placeholder = 'Select...',
  className,
  id,
  ...props
}) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-xs font-semibold text-surface-500">
          {label}
          {required && <span className="text-[#e11d48]"> *</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={clsx(
            'h-[42px] w-full appearance-none rounded-[11px] border bg-[#fbfbfd] px-[13px] pr-9 text-sm text-surface-700',
            'focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-brand-600/[0.14]',
            'disabled:bg-surface-100 disabled:text-surface-400',
            error ? 'border-[#e11d48]' : 'border-surface-200'
          )}
          aria-invalid={!!error}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) =>
            typeof opt === 'string' ? (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ) : (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )
          )}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
      </div>
      {error && <p className="mt-1 text-xs text-[#e11d48]">{error}</p>}
    </div>
  )
}