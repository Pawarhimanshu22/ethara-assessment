import { useState } from 'react'

import AppLayout from '../components/layout/AppLayout'
import ChatWindow from '../components/ai-assistant/ChatWindow'
import ChatInput from '../components/ai-assistant/ChatInput'
import SuggestedQueries from '../components/ai-assistant/SuggestedQueries'

import { aiService } from '../api/aiService'
import { useToast } from '../hooks/useToast'

export default function AiAssistantPage() {
  const toast = useToast()

  const [messages, setMessages] = useState(() => [
    {
      id: Date.now(),
      role: 'assistant',
      content:
        '👋 Hello! I can help you with employees, projects, seat allocation, floor availability and dashboard insights.',
    },
  ])

  const [loading, setLoading] = useState(false)

  const sendMessage = async (query) => {
    if (!query?.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: query,
    }

    setMessages((prev) => [...prev, userMessage])

    setLoading(true)

    try {
      const response = await aiService.query({
        query,
      })

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content:
          response?.answer ||
          'Sorry, I could not understand your request.',
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      toast.error(
        err?.message ||
          'AI Assistant is currently unavailable.'
      )

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content:
            '⚠️ AI service is currently unavailable. Please try again later.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="AI Assistant">
      <div className="mx-auto flex h-[calc(100vh-11rem)] max-w-[780px] animate-fadeup flex-col">

        <ChatWindow
          messages={messages}
          loading={loading}
        />

        <div className="pt-1.5">
          <div className="mb-3">
            <SuggestedQueries
              onSelect={sendMessage}
              disabled={loading}
            />
          </div>

          <ChatInput
            onSend={sendMessage}
            loading={loading}
          />
        </div>

      </div>
    </AppLayout>
  )
}