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

interface ResponsiveConfig {
    areaRatio: number
    linearScale: number
    areaScale: number
    viewportWidth: number
    viewportHeight: number
}

const CLOUD_IMAGE_LIGHT = "/images/cloud_dark.png"
const CLOUD_IMAGE_DARK = "/images/cloud.png"

// Breakpoints for device detection
const BREAKPOINTS = {
    MOBILE_MAX: 768,
    TABLET_MIN: 769,
    DESKTOP_MIN: 1024,
} as const

// Reference baseline (13" MacBook)
const BASELINE = {
    WIDTH: 1440,
    HEIGHT: 900,
    AREA: 1440 * 900, // 1,296,000
    BASE_WIDTH: 300, // Actual base width for 13" screen
} as const

const INITIAL_POSITIONS = [
    { leftPercent: 0.15, topPercent: 0.2 },   // Top left area
    { leftPercent: 0.75, topPercent: 0.15 },  // Top right area
    { leftPercent: 0.45, topPercent: 0.35 },  // Center area
    { leftPercent: 0.25, topPercent: 0.65 },  // Bottom left area
    { leftPercent: 0.65, topPercent: 0.75 },  // Bottom right area
    { leftPercent: 0.85, topPercent: 0.45 },  // Right center area
]

/**
 * Get responsive cloud configuration based on viewport dimensions
 * Returns null for mobile devices (no clouds)
 */
const getResponsiveCloudConfig = (viewportWidth: number, viewportHeight: number): ResponsiveConfig | null => {
    // Mobile: No clouds
    if (viewportWidth <= BREAKPOINTS.MOBILE_MAX) {
        return null
    }

    const currentArea = viewportWidth * viewportHeight
    const areaRatio = currentArea / BASELINE.AREA
    const linearScale = viewportWidth / BASELINE.WIDTH
    const areaScale = Math.sqrt(areaRatio) // sqrt prevents exponential growth on large screens

    return { areaRatio, linearScale, areaScale, viewportWidth, viewportHeight }
}

/**
 * Calculate responsive cloud counts based on viewport
 */
const getCloudCounts = (config: ResponsiveConfig | null): { initial: number; delayed: number } => {
    if (!config) return { initial: 0, delayed: 0 }

    // Scale cloud count based on area (with sqrt to control growth)
    const baseTotal = 9 // Current: 6 + 3
    const scaledTotal = Math.round(baseTotal * config.areaScale)
    const totalClouds = Math.max(4, Math.min(18, scaledTotal)) // 4-18 range

    const initialClouds = Math.ceil(totalClouds * 0.67) // Maintain 67/33 ratio
    const delayedClouds = totalClouds - initialClouds

    return { initial: initialClouds, delayed: delayedClouds }
}

/**
 * Calculate responsive cloud dimensions
 */
const getCloudDimensions = (config: ResponsiveConfig | null): { baseWidth: number; baseHeight: number } => {
    if (!config) return { baseWidth: 0, baseHeight: 0 }

    // Scale base width proportionally to viewport
    const scaledBaseWidth = BASELINE.BASE_WIDTH * config.linearScale

    // Ensure minimum size but scale appropriately
    const minWidth = Math.min(200, config.viewportWidth * 0.08)
    const baseWidth = Math.max(minWidth, scaledBaseWidth)

    // Height maintains 0.5 aspect ratio but respects viewport
    const baseHeight = Math.min(baseWidth * 0.5, config.viewportHeight * 0.25)

    return { baseWidth, baseHeight }
}

/**
 * Get responsive animation configuration
 */
const getAnimationConfig = (config: ResponsiveConfig | null) => {
    if (!config) return null

    // Scale duration inversely with screen size (larger screens = faster movement)
    const baseDurationRange = { min: 120, max: 240 } // Super slow: 2-4 minutes per cloud
    const durationScale = 1 / Math.sqrt(config.linearScale) // Inverse scaling

    const duration = {
        min: baseDurationRange.min * durationScale,
        max: baseDurationRange.max * durationScale,
    }

    // Scale opacity based on density (more clouds = slightly more transparent)
    const baseOpacityRange = { min: 0.15, max: 0.5 }
    const densityFactor = Math.min(1, config.areaScale) // Don't increase opacity on small screens

    const opacity = {
        min: baseOpacityRange.min * densityFactor,
        max: baseOpacityRange.max * densityFactor,
    }

    // Adjust scale range for smaller screens
    const scaleRange =
        config.viewportWidth < 1000
            ? { min: 0.5, max: 1.2 } // Smaller clouds on smaller screens
            : { min: 0.6, max: 1.4 } // Current range

    // Delay stays consistent
    const delayRange = { min: 0.2, max: 0.5 }

    return { duration, opacity, scaleRange, delayRange }
}

export default function CloudAnimated() {
    const { resolvedTheme } = useTheme()
    const [windowHeight, setWindowHeight] = useState(0)
    const [windowWidth, setWindowWidth] = useState(0)
    const [mounted, setMounted] = useState(false)
    const [responsiveConfig, setResponsiveConfig] = useState<ResponsiveConfig | null>(null)

    const [cloudState, setCloudState] = useState<CloudState>({
        clouds: [],
        initialCloudCount: 0,
        delayedCloudCount: 0,
    })

    // Generate cloud with responsive properties
    const generateCloud = useCallback(
        (id: number, type: "initial" | "delayed", positionIndex?: number, iteration: number = 0): CloudInstance => {
            if (!responsiveConfig) {
                return {
                    id,
                    iteration,
                    startX: 0,
                    endX: 0,
                    y: 0,
                    opacity: 0,
                    duration: 0,
                    scale: 0,
                    width: 0,
                    height: 0,
                    delay: 0,
                    type,
                }
            }

            const animConfig = getAnimationConfig(responsiveConfig)
            const { baseWidth } = getCloudDimensions(responsiveConfig)

            if (!animConfig || baseWidth === 0) {
                return {
                    id,
                    iteration,
                    startX: 0,
                    endX: 0,
                    y: 0,
                    opacity: 0,
                    duration: 0,
                    scale: 0,
                    width: 0,
                    height: 0,
                    delay: 0,
                    type,
                }
            }

            const scale = animConfig.scaleRange.min + Math.random() * (animConfig.scaleRange.max - animConfig.scaleRange.min)
            const width = baseWidth * scale
            const height = width * 0.5

            const duration = animConfig.duration.min + Math.random() * (animConfig.duration.max - animConfig.duration.min)
            const opacity = animConfig.opacity.min + Math.random() * (animConfig.opacity.max - animConfig.opacity.min)

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
                delay = type === "delayed" ? animConfig.delayRange.min + Math.random() * (animConfig.delayRange.max - animConfig.delayRange.min) : 0
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
        },
        [windowWidth, windowHeight, responsiveConfig]
    )

    useEffect(() => {
        setMounted(true)
        const newWidth = window.innerWidth
        const newHeight = window.innerHeight
        setWindowHeight(newHeight)
        setWindowWidth(newWidth)
        setResponsiveConfig(getResponsiveCloudConfig(newWidth, newHeight))

        const handleResize = () => {
            const resizedWidth = window.innerWidth
            const resizedHeight = window.innerHeight
            setWindowHeight(resizedHeight)
            setWindowWidth(resizedWidth)
            setResponsiveConfig(getResponsiveCloudConfig(resizedWidth, resizedHeight))
        }

        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Initialize clouds with fixed aesthetic positions
    useEffect(() => {
        if (!mounted || windowHeight === 0 || windowWidth === 0 || !responsiveConfig) return

        const cloudCounts = getCloudCounts(responsiveConfig)

        const initialClouds = Array.from({ length: cloudCounts.initial }, (_, i) =>
            generateCloud(i, "initial", i)
        )

        setCloudState(prev => ({
            ...prev,
            clouds: initialClouds,
            initialCloudCount: cloudCounts.initial,
        }))
    }, [mounted, windowHeight, windowWidth, responsiveConfig, generateCloud])

    // Add delayed clouds after 5 seconds
    useEffect(() => {
        if (!mounted || windowHeight === 0 || windowWidth === 0 || !responsiveConfig || cloudState.delayedCloudCount > 0) return

        const cloudCounts = getCloudCounts(responsiveConfig)

        const timer = setTimeout(() => {
            const delayedClouds = Array.from({ length: cloudCounts.delayed }, (_, i) =>
                generateCloud(cloudState.initialCloudCount + i, "delayed")
            )

            setCloudState(prev => ({
                ...prev,
                clouds: [...prev.clouds, ...delayedClouds],
                delayedCloudCount: cloudCounts.delayed,
            }))
        }, 5000)

        return () => clearTimeout(timer)
    }, [mounted, windowHeight, windowWidth, responsiveConfig, generateCloud, cloudState.delayedCloudCount, cloudState.initialCloudCount])

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

    if (!mounted || windowHeight === 0 || !responsiveConfig || cloudState.clouds.length === 0) return null

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
                opacity: isDark ? cloud.opacity * 0.5 : Math.min(cloud.opacity * 2.5, 1.0),
                backgroundImage: `url('${isDark ? CLOUD_IMAGE_DARK : CLOUD_IMAGE_LIGHT}')`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",

                WebkitMaskImage:
                    "radial-gradient(circle at center, black 75%, transparent 100%)",
                maskImage:
                    "radial-gradient(circle at center, black 75%, transparent 100%)",

                filter: isDark
                    ? "brightness(1.2) contrast(0.8) blur(0.5px) saturate(0.9)"
                    : "brightness(0.9) contrast(1.2) blur(1px) drop-shadow(0 0 1px rgba(0,0,0,0.25))",
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
