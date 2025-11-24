"use client"
import { useEffect, useState } from "react"
import ThemeToggle from "./theme-toggle"

export default function Navbar() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="relative z-30 w-full">
      <div className="flex items-center justify-between px-6 sm:px-8 lg:px-12 py-4 sm:py-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:inline">Riverline</span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#product" className="text-foreground/80 hover:text-foreground transition-colors text-sm">
            Product
          </a>
          <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors text-sm">
            Pricing
          </a>
        </div>

        {/* Right: Book Demo Button + Theme Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button className="px-4 sm:px-6 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-colors text-sm">
            Book Demo
          </button>
          {mounted && <ThemeToggle />}
        </div>
      </div>
    </nav>
  )
}
