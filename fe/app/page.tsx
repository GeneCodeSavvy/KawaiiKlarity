"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/navbar"
import AnimatedBackground from "@/components/animated-background"
import CloudAnimated from "@/components/cloud-animated"
import WavyMesh from "@/components/wavy-mesh"
import { useLanguage } from "@/hooks/use-language"

const containerVariants = {
    hidden: { 
        opacity: 0 
    },
    visible: {
        opacity: 1,
        transition: { 
            staggerChildren: 0.05, 
            delayChildren: 0.1 
        }
    },
    exit: {
        opacity: 0,
        transition: { 
            staggerChildren: 0.05, 
            staggerDirection: -1,
            duration: 0.2
        }
    }
}

const itemVariants = {
    hidden: { 
        opacity: 0, 
        y: -10, 
        scale: 0.98 
    },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1
    },
    exit: { 
        opacity: 0, 
        y: 10, 
        scale: 0.98
    }
}

const buttonVariants = {
    hidden: { 
        opacity: 0, 
        y: -10, 
        scale: 0.95 
    },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1
    },
    exit: { 
        opacity: 0, 
        y: 10, 
        scale: 0.95
    }
}

export default function Page() {
    const [mounted, setMounted] = useState(false)
    const { content, currentLang } = useLanguage()

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
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentLang}
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="min-h-[400px] flex flex-col justify-center"
                            >
                                <motion.h1 
                                    variants={itemVariants}
                                    className={`text-3xl sm:text-3xl lg:text-3xl font-bold text-pretty mb-6 text-primary ${
                                        currentLang === "JP" ? "leading-relaxed jp-text" : ""
                                    }`}
                                >
                                    {content.headline.split('\n').map((line, index) => (
                                        <span key={index}>
                                            {line}
                                            {index < content.headline.split('\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </motion.h1>

                                <motion.p 
                                    variants={itemVariants}
                                    className={`text-lg sm:text-xl text-foreground/80 mb-8 text-pretty ${
                                        currentLang === "JP" ? "leading-relaxed jp-text" : ""
                                    }`}
                                >
                                    {content.lead1}
                                </motion.p>

                                <motion.p 
                                    variants={itemVariants}
                                    className={`text-lg sm:text-xl text-foreground/80 mb-8 text-pretty ${
                                        currentLang === "JP" ? "leading-relaxed jp-text" : ""
                                    }`}
                                >
                                    {content.lead2}
                                </motion.p>

                                <motion.button 
                                    variants={buttonVariants}
                                    className={`px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity ${
                                        currentLang === "JP" ? "jp-text" : ""
                                    }`}
                                    aria-label={content.ctaAriaLabel}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {content.cta}
                                </motion.button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
