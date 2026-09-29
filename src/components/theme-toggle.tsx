'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme()

  // Both icons render and CSS picks one, so there's no hydration mismatch or placeholder state.
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle light/dark mode"
    >
      <Sun className="size-[1.1rem] dark:hidden" />
      <Moon className="hidden size-[1.1rem] dark:block" />
    </Button>
  )
}
