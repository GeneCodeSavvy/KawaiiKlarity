"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

interface CloudInstance {
  id: number
  left: number
  top: number
  opacity: number
  duration: number
  scale: number
  width: number
  height: number
}

const CLOUD_IMAGE = "/images/cloud.png"

export default function CloudAnimated() {
  const { resolvedTheme } = useTheme()
  const [clouds, setClouds] = useState<CloudInstance[]>([])
  const [windowHeight, setWindowHeight] = useState(0)
  const [windowWidth, setWindowWidth] = useState(0)
  const [mounted, setMounted] = useState(false)

  const generateRandomCloud = useCallback((id: number): CloudInstance => {
    const scale = 0.6 + Math.random() * 0.8 // was 0.9-1.2, now 0.6-1.4
    const baseWidth = Math.max(300, windowWidth * 0.15) // Responsive to screen width
    const width = baseWidth * scale
    const height = width * 0.5 // Maintain aspect ratio

    const duration = 15 + Math.random() * 30

    // Ensure random vertical positioning across the full height
    const top = Math.random() * Math.max(0, windowHeight - height * 0.5)

    const opacity = 0.15 + Math.random() * 0.35

    return {
      id,
      left: -width,
      top,
      opacity,
      duration,
      scale,
      width,
      height,
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

  // Separate effect for generating clouds after dimensions are set
  useEffect(() => {
    if (!mounted || windowHeight === 0 || windowWidth === 0) return

    // Initialize 4 clouds with staggered start times
    const initialClouds = Array.from({ length: 4 }, (_, i) => {
      const cloud = generateRandomCloud(i)
      // Stagger initial positions so clouds don't all start at once
      cloud.left = -cloud.width - (Math.random() * windowWidth * 0.5)
      return cloud
    })
    setClouds(initialClouds)
  }, [mounted, windowHeight, windowWidth, generateRandomCloud])

  if (!mounted || windowHeight === 0 || clouds.length === 0) return null

  const isDark = resolvedTheme === "dark"

  return (
    <div className="absolute inset-0 z-10 overflow-hidden">
      {clouds.map((cloud) => (
        <CloudElement
          key={cloud.id}
          cloud={cloud}
          windowHeight={windowHeight}
          isDark={isDark}
          onCycleComplete={() => {
            setClouds((prev) => prev.map((c) => (c.id === cloud.id ? generateRandomCloud(cloud.id) : c)))
          }}
        />
      ))}
    </div>
  )
}

function CloudElement({
  cloud,
  windowHeight,
  isDark,
  onCycleComplete,
}: {
  cloud: CloudInstance
  windowHeight: number
  isDark: boolean
  onCycleComplete: () => void
}) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const animation = elementRef.current.animate(
      [{ left: `${-cloud.width}px` }, { left: `${window.innerWidth + cloud.width}px` }],
      {
        duration: cloud.duration * 1000,
        easing: "linear",
        fill: "forwards",
      },
    )

    const handleFinish = () => {
      onCycleComplete()
    }

    animation.addEventListener("finish", handleFinish)
    return () => {
      animation.removeEventListener("finish", handleFinish)
      animation.cancel()
    }
  }, [cloud, onCycleComplete])

  return (
    <div
      ref={elementRef}
      className="absolute pointer-events-none"
      style={{
        top: `${cloud.top}px`,
        left: `${cloud.left}px`,
        width: `${cloud.width}px`,
        height: `${cloud.height}px`,
        opacity: isDark ? cloud.opacity * 0.5 : cloud.opacity,
        backgroundImage: `url('${CLOUD_IMAGE}')`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        filter: isDark 
          ? "brightness(1.2) contrast(0.8) blur(0.5px) saturate(0.9)" 
          : "brightness(1.1) contrast(0.9) blur(0.3px) saturate(1.1)",
      }}
    />
  )
}
