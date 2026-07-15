import { create } from 'zustand'

export const useAiStore = create((set) => ({
  messages: [
    {
      id: Date.now(),
      role: 'assistant',
      content:
        '👋 Hello! I can help you with employees, projects, seat allocation, dashboard insights, and seat availability.',
    },
  ],

  loading: false,

  setLoading: (loading) =>
    set({
      loading,
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) =>
    set({
      messages,
    }),

  clearMessages: () =>
    set({
      messages: [
        {
          id: Date.now(),
          role: 'assistant',
          content:
            '👋 Hello! I can help you with employees, projects, seat allocation, dashboard insights, and seat availability.',
        },
      ],
    }),

  resetChat: () =>
    set({
      loading: false,
      messages: [
        {
          id: Date.now(),
          role: 'assistant',
          content:
            '👋 Hello! I can help you with employees, projects, seat allocation, dashboard insights, and seat availability.',
        },
      ],
    }),
}))