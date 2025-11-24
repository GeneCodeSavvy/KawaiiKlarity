"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function WavyMesh() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <svg
      className="absolute inset-0 z-20 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1440 900"
      style={{
        opacity: isDark ? 0.08 : 0.12,
      }}
    >
      <defs>
        <style>
          {`
            @keyframes drift {
              0%, 100% { transform: translateX(0px); }
              50% { transform: translateX(50px); }
            }
            .wavy-line {
              animation: drift 8s ease-in-out infinite;
              transform-origin: center;
            }
          `}
        </style>
      </defs>

      {/* Multiple sine wave lines */}
      {Array.from({ length: 40 }).map((_, i) => {
        const y = (i * 900) / 40
        const offset = i % 2 === 0 ? 0 : Math.PI

        return (
          <g key={i} className="wavy-line">
            <path
              d={generateSinePath(0, y, 1440, 900)}
              stroke={isDark ? "#ffffff" : "#9f7aea"}
              strokeWidth="0.5"
              fill="none"
              opacity={isDark ? "0.1" : "0.15"}
            />
          </g>
        )
      })}
    </svg>
  )
}

function generateSinePath(startX: number, startY: number, width: number, amplitude: number): string {
  const points = []
  const frequency = 0.015
  const waveAmplitude = 20

  for (let x = startX; x <= startX + width; x += 10) {
    const y = startY + Math.sin(x * frequency) * waveAmplitude
    points.push(`${x},${y}`)
  }

  return `M ${points.join(" L ")}`
}
