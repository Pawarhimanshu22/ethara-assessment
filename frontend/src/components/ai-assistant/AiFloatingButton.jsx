import { Sparkles } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function AiFloatingButton() {
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname === '/assistant') return null

  return (
    <button
      onClick={() => navigate('/assistant')}
      className="fixed bottom-6 right-6 z-50 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_10px_28px_rgba(79,70,229,0.4)] transition-transform hover:scale-105 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
      aria-label="Open AI assistant"
    >
      <Sparkles className="h-[22px] w-[22px]" strokeWidth={2} />
    </button>
  )
}
