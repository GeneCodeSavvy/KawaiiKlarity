"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import AnimatedBackground from "@/components/animated-background"
import CloudAnimated from "@/components/cloud-animated"
import WavyMesh from "@/components/wavy-mesh"

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Layer 0: Gradient Background */}
      <AnimatedBackground />

      {/* Layer 10: Clouds */}
      <CloudAnimated />

      {/* Layer 20: Wavy Mesh */}
      <WavyMesh />

      {/* Layer 30: Content & Navbar */}
      <div className="relative z-30 w-full h-full flex flex-col">
        <Navbar />

        {/* Hero Section - Centered */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl text-center p-10 bg-background border border-rose-400">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-pretty mb-6 text-primary">
              Creating win-win in debt resolution for banks & borrowers
            </h1>

            <p className="text-lg sm:text-xl text-foreground/80 mb-8 text-pretty">
              Increase Recovery Rates. Decrease Collection Costs. Be 100% compliant
            </p>

            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              Book Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
