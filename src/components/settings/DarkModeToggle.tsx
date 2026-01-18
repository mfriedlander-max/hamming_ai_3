'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

const STORAGE_KEY = 'subcycle_theme'

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === 'dark'
}

function getServerSnapshot(): boolean {
  return false
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

export function DarkModeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const handleToggle = useCallback((checked: boolean) => {
    if (checked) {
      document.documentElement.classList.add('dark')
      localStorage.setItem(STORAGE_KEY, 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem(STORAGE_KEY, 'light')
    }
    // Trigger a re-render by dispatching storage event
    window.dispatchEvent(new Event('storage'))
  }, [])

  // Sync DOM with state on mount
  if (typeof window !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isDark ? (
          <Moon className="h-4 w-4 text-gray-500" />
        ) : (
          <Sun className="h-4 w-4 text-gray-500" />
        )}
        <span className="text-sm font-medium">Dark Mode</span>
      </div>
      <Switch checked={isDark} onCheckedChange={handleToggle} />
    </div>
  )
}
