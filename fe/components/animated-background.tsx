"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function AnimatedBackground() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgb(6, 12, 29) 0%, rgb(15, 25, 50) 50%, rgb(6, 12, 29) 100%)"
          : "linear-gradient(135deg, #f0e6ff 0%, #e6f5ff 50%, #f0e6ff 100%)",
      }}
    />
  )
}
