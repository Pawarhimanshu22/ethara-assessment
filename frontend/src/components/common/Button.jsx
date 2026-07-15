import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary:
    'bg-white text-surface-700 border border-surface-200 hover:bg-surface-50 focus-visible:ring-surface-400',
  ghost:
    'bg-white text-surface-700 border border-surface-200 hover:bg-surface-50 focus-visible:ring-surface-400',
  danger:
    'bg-[#e11d48] text-white hover:bg-[#be123c] focus-visible:ring-[#e11d48]',
  subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-400',
}

const SIZES = {
  sm: 'h-[34px] px-[13px] text-[12.5px]',
  md: 'h-10 px-[15px] text-[13.5px]',
  lg: 'h-12 px-5 text-sm',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  type = 'button',
  className,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-[7px] rounded-[11px] font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      {children}
    </button>
  )
}