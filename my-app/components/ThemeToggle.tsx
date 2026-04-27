'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-md border border-gray-200 dark:border-gray-600">
      <button
        onClick={() => setTheme('light')}
        className={`px-2 py-1 text-xs rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 font-bold'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
      >
        Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`px-2 py-1 text-xs rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 font-bold'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
      >
        Dark
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`px-2 py-1 text-xs rounded-md transition-colors ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 font-bold'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
      >
        System
      </button>
    </div>
  )
}
