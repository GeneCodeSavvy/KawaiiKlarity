"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isAnimating, setIsAnimating] = React.useState(false)

  const handleToggle = () => {
    setIsAnimating(true)
    setTheme(theme === "light" ? "dark" : "light")

    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={handleToggle}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-primary/20 hover:border-primary/40 hover:drop-shadow-[0_0_12px_var(--color-primary)] transition-all duration-200 group"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon */}
        <Sun
          className={`absolute w-5 h-5 text-primary transition-all duration-300 ${
            isDark ? "opacity-0 scale-0 rotate-180" : "opacity-100 scale-100 rotate-0"
          }`}
        />

        {/* Moon Icon */}
        <Moon
          className={`absolute w-5 h-5 text-primary transition-all duration-300 ${
            isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-180"
          }`}
        />
      </div>

      {/* GIF-style mask reveal effect overlay */}
      <div
        className={`absolute inset-0 rounded-lg bg-primary/10 transition-all duration-300 ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      />
    </button>
  )
}
