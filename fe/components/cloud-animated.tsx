"use client"

import { useCallback, useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

interface CloudInstance {
    id: number
    iteration: number // Increment this to force re-animation
    startX: number
    endX: number
    y: number
    opacity: number
    duration: number
    scale: number
    width: number
    height: number
    delay: number
    type: "initial" | "delayed"
}

interface CloudState {
    clouds: CloudInstance[]
    initialCloudCount: number
    delayedCloudCount: number
}

const CLOUD_IMAGE = "/images/cloud.png"

const INITIAL_POSITIONS = [
    { leftPercent: 0.15, topPercent: 0.2 },   // Top left area
    { leftPercent: 0.75, topPercent: 0.15 },  // Top right area
    { leftPercent: 0.45, topPercent: 0.35 },  // Center area
    { leftPercent: 0.25, topPercent: 0.65 },  // Bottom left area
    { leftPercent: 0.65, topPercent: 0.75 },  // Bottom right area
    { leftPercent: 0.85, topPercent: 0.45 },  // Right center area
]

export default function CloudAnimated() {
    const { resolvedTheme } = useTheme()
    const [windowHeight, setWindowHeight] = useState(0)
    const [windowWidth, setWindowWidth] = useState(0)
    const [mounted, setMounted] = useState(false)

    const [cloudState, setCloudState] = useState<CloudState>({
        clouds: [],
        initialCloudCount: 6,
        delayedCloudCount: 0,
    })

    const generateCloud = useCallback((id: number, type: "initial" | "delayed", positionIndex?: number, iteration: number = 0): CloudInstance => {
        const scale = 0.6 + Math.random() * 0.8
        const baseWidth = Math.max(300, windowWidth * 0.15)
        const width = baseWidth * scale
        const height = width * 0.5

        const duration = 30 + Math.random() * 30
        const opacity = 0.15 + Math.random() * 0.35

        let startX: number
        let endX: number
        let y: number
        let delay: number

        if (type === "initial" && positionIndex !== undefined) {
            // Fixed aesthetic positions for initial render
            const position = INITIAL_POSITIONS[positionIndex % INITIAL_POSITIONS.length]
            startX = position.leftPercent * (windowWidth - width)
            endX = windowWidth + width
            y = position.topPercent * (windowHeight - height)
            delay = 0
        } else {
            // Start from left for delayed clouds or regenerated initial clouds
            startX = -width
            endX = windowWidth + width
            y = Math.random() * Math.max(0, windowHeight - height * 0.5)
            delay = type === "delayed" ? 0.2 + Math.random() * 0.3 : 0
        }

        return {
            id,
            iteration,
            startX,
            endX,
            y,
            opacity,
            duration,
            scale,
            width,
            height,
            delay,
            type,
        }
    }, [windowWidth, windowHeight])

    useEffect(() => {
        setMounted(true)
        setWindowHeight(window.innerHeight)
        setWindowWidth(window.innerWidth)

        const handleResize = () => {
            setWindowHeight(window.innerHeight)
            setWindowWidth(window.innerWidth)
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Initialize clouds with fixed aesthetic positions
    useEffect(() => {
        if (!mounted || windowHeight === 0 || windowWidth === 0) return

        const initialClouds = Array.from({ length: 6 }, (_, i) =>
            generateCloud(i, "initial", i)
        )

        setCloudState(prev => ({
            ...prev,
            clouds: initialClouds,
        }))
    }, [mounted, windowHeight, windowWidth, generateCloud])

    // Add delayed clouds after 5 seconds
    useEffect(() => {
        if (!mounted || windowHeight === 0 || windowWidth === 0 || cloudState.delayedCloudCount > 0) return

        const timer = setTimeout(() => {
            const delayedClouds = Array.from({ length: 3 }, (_, i) =>
                generateCloud(cloudState.initialCloudCount + i, "delayed")
            )

            setCloudState(prev => ({
                ...prev,
                clouds: [...prev.clouds, ...delayedClouds],
                delayedCloudCount: 3,
            }))
        }, 5000)

        return () => clearTimeout(timer)
    }, [mounted, windowHeight, windowWidth, generateCloud, cloudState.delayedCloudCount, cloudState.initialCloudCount])

    const handleCloudCycleComplete = useCallback((completedCloud: CloudInstance) => {
        setCloudState(prev => ({
            ...prev,
            clouds: prev.clouds.map(cloud =>
                cloud.id === completedCloud.id
                    ? generateCloud(cloud.id, "delayed", undefined, completedCloud.iteration + 1) // Regenerate with incremented iteration
                    : cloud
            )
        }))
    }, [generateCloud])

    if (!mounted || windowHeight === 0 || cloudState.clouds.length === 0) return null

    const isDark = resolvedTheme === "dark"

    return (
        <div className="absolute inset-0 z-10 overflow-hidden">
            {cloudState.clouds.map((cloud) => (
                <CloudElement
                    key={`${cloud.id}-${cloud.iteration}`}
                    cloud={cloud}
                    isDark={isDark}
                    onAnimationComplete={() => handleCloudCycleComplete(cloud)}
                />
            ))}
        </div>
    )
}

function CloudElement({
    cloud,
    isDark,
    onAnimationComplete,
}: {
    cloud: CloudInstance
    isDark: boolean
    onAnimationComplete: () => void
}) {
    return (
        <motion.div
            className="absolute pointer-events-none"
            style={{
                top: `${cloud.y}px`,
                width: `${cloud.width}px`,
                height: `${cloud.height}px`,
                opacity: isDark ? cloud.opacity * 0.5 : cloud.opacity,
                backgroundImage: `url('${CLOUD_IMAGE}')`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",

                WebkitMaskImage:
                    "radial-gradient(circle at center, black 75%, transparent 100%)",
                maskImage:
                    "radial-gradient(circle at center, black 75%, transparent 100%)",

                filter: isDark
                    ? "brightness(1.2) contrast(0.8) blur(0.5px) saturate(0.9)"
                    : "brightness(1) contrast(1.05) saturate(1.3) hue-rotate(200deg) blur(3px)",
            }}
            initial={{ x: cloud.startX }}
            animate={{ x: cloud.endX }}
            transition={{
                duration: cloud.duration,
                delay: cloud.delay,
                ease: "linear",
            }}
            onAnimationComplete={onAnimationComplete}
        />
    )
}
