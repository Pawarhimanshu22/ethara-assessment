import { createContext, useContext, useCallback, useState } from 'react'

const ToastContext = createContext(null)
let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (message, type = 'success', duration = 4000) => {
      const id = ++idCounter
      setToasts((prev) => [...prev, { id, message, type }])
      if (duration) {
        setTimeout(() => remove(id), duration)
      }
      return id
    },
    [remove]
  )

  const toast = {
    success: (msg, duration) => push(msg, 'success', duration),
    error: (msg, duration) => push(msg, 'error', duration),
    info: (msg, duration) => push(msg, 'info', duration),
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, remove }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}

export function useToastList() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastList must be used within ToastProvider')
  return { toasts: ctx.toasts, remove: ctx.remove }
}