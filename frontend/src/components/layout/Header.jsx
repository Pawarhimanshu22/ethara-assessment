import { Menu, Search, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Header({ onMenuClick, title, subtitle }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex h-[66px] items-center justify-between border-b border-surface-200 bg-canvas/85 px-4 backdrop-blur-[8px] sm:px-7">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 text-surface-500 hover:bg-surface-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-[19px] text-surface-900">{title}</h1>
          {subtitle && <p className="text-[12.5px] text-surface-400">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={() => navigate('/search')}
          className="hidden h-10 w-[260px] items-center gap-2 rounded-[11px] border border-surface-200 bg-white px-[13px] text-left sm:flex"
        >
          <Search className="h-[15px] w-[15px] flex-shrink-0 text-surface-400" />
          <span className="truncate text-[13px] text-surface-400">Search employees, seats…</span>
        </button>
        <button
          onClick={() => navigate('/assistant')}
          className="inline-flex h-10 items-center gap-[7px] whitespace-nowrap rounded-[11px] bg-brand-600 px-[15px] text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <Sparkles className="h-[15px] w-[15px]" />
          Ask AI
        </button>
      </div>
    </header>
  )
}
