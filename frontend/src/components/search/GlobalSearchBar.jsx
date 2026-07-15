import { Search } from 'lucide-react'

export default function GlobalSearchBar({ value, onChange, placeholder }) {
  return (
    <div className="mb-2 flex h-[52px] items-center gap-2.5 rounded-2xl border border-surface-200 bg-white px-[18px] shadow-card">
      <Search className="h-[19px] w-[19px] shrink-0 text-surface-400" strokeWidth={2} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          placeholder || 'Search by name, employee ID, email, project or seat…'
        }
        className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-surface-900 placeholder:text-surface-400 focus:outline-none"
      />
    </div>
  )
}
