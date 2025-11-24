"use client"
import { useEffect, useState } from "react"
import { ThemeToggleEnhanced } from "./theme-toggle-enhanced"
import LanguageSelector from "./language-selector"

export default function Navbar() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="relative z-30 w-full flex justify-center">
      <div className="grid grid-cols-[auto_1fr_auto] items-center w-full max-w-6xl px-6 sm:px-8 lg:px-12 py-4 sm:py-6">
        {/* Logo - Left Column */}
        <div className="flex items-center gap-2 justify-start">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">K</span>
          </div>
          <span className="font-bold text-2xl text-foreground hidden sm:inline">KawaiiKlarity</span>
        </div>

        {/* Center Links - Middle Column */}
        <div className="hidden md:flex items-center justify-center gap-8 ml-16">
          <a href="https://github.com/GeneCodeSavvy/KawaiiKlarity" target="_blank" rel="noopener" className="text-foreground/80 hover:text-foreground transition-colors text-lg">
            Github
          </a>
          <a href="https://resume.harsh-dev.xyz" target="_blank" rel="noopener" className="text-foreground/80 hover:text-foreground transition-colors text-lg">
            Resume
          </a>
        </div>

        {/* Right: Book Demo Button + Language Selector + Theme Toggle - Right Column */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 h-10">
          <button className="px-4 sm:px-6 py-1 border border-primary text-primary-foreground rounded-lg font-medium bg-primary hover:opacity-90 text-lg flex items-center">
            Sign In
          </button>
          <div className="h-full flex items-center">
            <LanguageSelector />
          </div>
           {mounted && <ThemeToggleEnhanced variant="circle" start="center" />}
        </div>
      </div>
    </nav>
  )
}
