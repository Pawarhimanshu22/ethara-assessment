import { AlertCircle, RotateCcw } from 'lucide-react'
import Button from './Button'

export default function ErrorState({
  title = "Couldn't load this data",
  message = 'Something went wrong while contacting the server.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3.5 py-14 text-center">
      <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-[#fff1f3]">
        <AlertCircle className="h-6 w-6 text-[#e11d48]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-surface-700">{title}</p>
        <p className="mt-1 max-w-sm text-[12.5px] text-surface-400">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={RotateCcw} onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}