import { useEffect, useState, useMemo } from "react"

interface WaveConfig {
  frequency: number
  amplitude: number
  stepSize: number
}

interface ResponsiveWavesReturn {
  viewportWidth: number
  viewportHeight: number
  viewBoxWidth: number
  viewBoxHeight: number
  viewBox: string
  animationRange: number
  bufferExtension: number
  waveConfig: WaveConfig
  lineCount: number
  breakpoint: "mobile" | "tablet" | "desktop" | "large" | "ultrawide"
}

const BREAKPOINT_CONFIG: Record<string, { max: number; config: WaveConfig }> = {
  mobile: {
    max: 767,
    config: { frequency: 0.012, amplitude: 15, stepSize: 8 },
  },
  tablet: {
    max: 1023,
    config: { frequency: 0.014, amplitude: 18, stepSize: 9 },
  },
  desktop: {
    max: 1439,
    config: { frequency: 0.015, amplitude: 20, stepSize: 10 },
  },
  large: {
    max: 1919,
    config: { frequency: 0.016, amplitude: 22, stepSize: 8 },
  },
  ultrawide: {
    max: Infinity,
    config: { frequency: 0.018, amplitude: 25, stepSize: 6 },
  },
}

const getBreakpoint = (
  width: number
): "mobile" | "tablet" | "desktop" | "large" | "ultrawide" => {
  if (width < 768) return "mobile"
  if (width < 1024) return "tablet"
  if (width < 1440) return "desktop"
  if (width < 1920) return "large"
  return "ultrawide"
}

const calculateLineCount = (height: number): number => {
  // Optimal line density: one line per ~23px of height
  const calculated = Math.floor(height / 23)
  const minLines = 15
  const maxLines = 60
  return Math.max(minLines, Math.min(calculated, maxLines))
}

const calculateAnimationRange = (width: number): number => {
  // 3.5% of viewport width, capped at 80px
  return Math.min(width * 0.035, 80)
}

const calculateBufferExtension = (width: number): number => {
  // 7% buffer on each side
  return width * 0.07
}

export const useResponsiveWaves = (): ResponsiveWavesReturn => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1440,
    height: typeof window !== "undefined" ? window.innerHeight : 900,
  })

  useEffect(() => {
    // Set initial dimensions on mount
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }, 300)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  const breakpoint = useMemo(
    () => getBreakpoint(dimensions.width),
    [dimensions.width]
  )

  const waveConfig = useMemo(
    () => BREAKPOINT_CONFIG[breakpoint].config,
    [breakpoint]
  )

  const viewBoxWidth = useMemo(
    () => Math.round(dimensions.width),
    [dimensions.width]
  )

  const viewBoxHeight = useMemo(
    () => Math.round(dimensions.height),
    [dimensions.height]
  )

  const animationRange = useMemo(
    () => calculateAnimationRange(viewBoxWidth),
    [viewBoxWidth]
  )

  const bufferExtension = useMemo(
    () => calculateBufferExtension(viewBoxWidth),
    [viewBoxWidth]
  )

  const lineCount = useMemo(
    () => calculateLineCount(viewBoxHeight),
    [viewBoxHeight]
  )

  const viewBox = useMemo(
    () => `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
    [viewBoxWidth, viewBoxHeight]
  )

  return {
    viewportWidth: dimensions.width,
    viewportHeight: dimensions.height,
    viewBoxWidth,
    viewBoxHeight,
    viewBox,
    animationRange,
    bufferExtension,
    waveConfig,
    lineCount,
    breakpoint,
  }
}
