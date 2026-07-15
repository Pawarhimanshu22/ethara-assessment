import api from './axios'

/**
 * The /ai/query endpoint may not be live on the backend yet.
 * This service calls it normally, but callers should always handle
 * the `unavailable` flag so the UI can fall back gracefully
 * (e.g. show a "assistant is warming up" state) instead of crashing.
 */
export const aiService = {
  query: async (input) => {
    // Callers may pass a raw string or an object like { query, email }.
    const body =
      typeof input === 'string'
        ? { query: input }
        : { query: input?.query, email: input?.email }
    try {
      const { data } = await api.post('/ai/query', body)
      return { answer: data.answer, intent_detected: data.intent_detected, unavailable: false }
    } catch (err) {
      const status = err?.status
      if (status === 404 || status === 501) {
        return {
          answer: null,
          unavailable: true,
          message: 'The AI assistant is not available yet. Please try again later.',
        }
      }
      return {
        answer: null,
        unavailable: true,
        message: err?.message || 'Could not reach the AI assistant.',
      }
    }
  },

  examples: async () => {
    // Suggested prompt chips built from real data. Falls back to static prompts.
    try {
      const { data } = await api.get('/ai/examples')
      return Array.isArray(data) && data.length ? data : null
    } catch {
      return null
    }
  },
}