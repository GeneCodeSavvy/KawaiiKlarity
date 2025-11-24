"use client"

import { useTheme } from "next-themes"
import { useEffect, useState, useMemo } from "react"
import { useResponsiveWaves } from "@/hooks/use-responsive-waves"

export default function WavyMesh() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const {
    viewBox,
    animationRange,
    bufferExtension,
    waveConfig,
    lineCount,
  } = useResponsiveWaves()

  // Memoize the animation keyframes to avoid recalculation
  const animationKeyframes = useMemo(() => {
    return `
      @keyframes drift {
        0%, 100% { transform: translateX(0px); }
        50% { transform: translateX(${animationRange}px); }
      }
      .wavy-line {
        animation: drift 8s ease-in-out infinite;
        transform-origin: center;
      }
    `
  }, [animationRange])

  // Parse viewBox to get dimensions
  const viewBoxParts = useMemo(() => viewBox.split(" ").map(Number), [viewBox])
  const vbWidth = viewBoxParts[2] || 1440
  const vbHeight = viewBoxParts[3] || 900

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <svg
      className="absolute inset-0 z-20 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      viewBox={viewBox}
      style={{
        opacity: isDark ? 0.25 : 0.35,
      }}
    >
      <defs>
        <style>{animationKeyframes}</style>
      </defs>

      {/* Multiple sine wave lines */}
      {Array.from({ length: lineCount }).map((_, i) => {
        const y = (i * vbHeight) / lineCount

        return (
          <g key={i} className="wavy-line">
            <path
              d={generateSinePath(
                -bufferExtension,
                y,
                vbWidth + bufferExtension * 2,
                waveConfig
              )}
              stroke={isDark ? "#ffffff" : "#9f7aea"}
              strokeWidth="1.5"
              fill="none"
              opacity={isDark ? "0.3" : "0.4"}
            />
          </g>
        )
      })}
    </svg>
  )
}

interface WaveConfig {
  frequency: number
  amplitude: number
  stepSize: number
}

function generateSinePath(
  startX: number,
  startY: number,
  width: number,
  config: WaveConfig
): string {
  const points = []

  for (let x = startX; x <= startX + width; x += config.stepSize) {
    const y = startY + Math.sin(x * config.frequency) * config.amplitude
    points.push(`${x},${y}`)
  }

  return `M ${points.join(" L ")}`
}
