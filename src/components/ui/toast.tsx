'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

type ToastType = 'info' | 'success' | 'error'

interface ToastData {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toasts: ToastData[]
  toast: (options: { message: string; type?: ToastType }) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ message, type = 'info' }: { message: string; type?: ToastType }) => {
      const id = Math.random().toString(36).substr(2, 9)
      setToasts((prev) => [...prev, { id, message, type }])

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        dismiss(id)
      }, 5000)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  )
}

interface ToastProps {
  message: string
  type?: ToastType
  onDismiss: () => void
}

const typeStyles: Record<ToastType, string> = {
  info: 'bg-gray-50 text-gray-800 border-gray-200',
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
}

export function Toast({ message, type = 'info', onDismiss }: ToastProps) {
  return (
    <div
      role="alert"
      className={cn(
        'px-4 py-3 rounded-lg border shadow-lg min-w-[300px] flex items-center justify-between',
        typeStyles[type]
      )}
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-4 text-current opacity-50 hover:opacity-100"
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  )
}
