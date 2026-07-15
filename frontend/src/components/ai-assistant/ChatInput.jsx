import { useState } from 'react'
import { Send } from 'lucide-react'

export default function ChatInput({ onSend, disabled, loading }) {
  const [value, setValue] = useState('')

  const busy = disabled || loading

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || busy) return
    onSend(trimmed)
    setValue('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    submit()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2.5 rounded-2xl border border-surface-200 bg-white py-2 pl-4 pr-2 shadow-card"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about seats, projects, availability…"
        disabled={busy}
        className="min-w-0 flex-1 border-none bg-transparent py-[9px] text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={busy || !value.trim()}
        aria-label="Send"
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[11px] bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        <Send className="h-[17px] w-[17px]" strokeWidth={2} />
      </button>
    </form>
  )
}
