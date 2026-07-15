import { useEffect, useState } from 'react'
import { aiService } from '../../api/aiService'

const FALLBACK = [
  'Show available seats on Floor 3',
  'How many new joiners are pending?',
  'Give me a workspace summary',
]

export default function SuggestedQueries({ onSelect, disabled }) {
  const [suggestions, setSuggestions] = useState(FALLBACK)

  useEffect(() => {
    let alive = true
    aiService.examples().then((list) => {
      if (alive && list?.length) setSuggestions(list)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="flex flex-wrap gap-[7px]">
      {suggestions.map((q) => (
        <button
          key={q}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(q)}
          className="rounded-full border border-brand-100 bg-brand-50 px-3 py-[7px] text-[12.5px] font-medium text-brand-600 transition-colors hover:bg-brand-100 disabled:opacity-50"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
