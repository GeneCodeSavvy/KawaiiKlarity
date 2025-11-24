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
                        <h1 className="text-3xl sm:text-3xl lg:text-3xl font-bold text-pretty mb-6 text-primary">
                            Not sure what to wear today? <br/> Marin-chan will decide for you.
                        </h1>

                        <p className="text-lg sm:text-xl text-foreground/80 mb-8 text-pretty">
                            Marin chan is weather-aware, and a dressing queen
                        </p>

                        <p className="text-lg sm:text-xl text-foreground/80 mb-8 text-pretty">
                            She can recognize your clothes with pictures, and select outfits that are cute, and perfectly you.
                        </p>

                        <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                            Chat with Marin Chan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
