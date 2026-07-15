import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3.5 py-14 text-center">
      <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-surface-100 text-surface-300">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-surface-700">{title}</p>
        {description && <p className="mt-1 text-[12.5px] text-surface-400">{description}</p>}
      </div>
      {action}
    </div>
  )
}