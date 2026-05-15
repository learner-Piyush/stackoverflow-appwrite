"use client"

import React, { useEffect, useMemo, useState } from "react"

import { cn } from "@/lib/utils"

interface MeteorsProps {
  number?: number
  minDelay?: number
  maxDelay?: number
  minDuration?: number
  maxDuration?: number
  angle?: number
  className?: string
}

function mulberry32(seed: number) {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}: MeteorsProps) => {
  // Precompute deterministic styles (render-safe)
  const styles = useMemo(() => {
    const rand = mulberry32(number * 999 + angle * 13)
    return [...new Array(number)].map(() => {
      const leftPx = Math.floor(rand() * 1200)
      const delay = rand() * (maxDelay - minDelay) + minDelay
      const duration = Math.floor(rand() * (maxDuration - minDuration) + minDuration)

      return {
        "--angle": -angle + "deg",
        top: "-5%",
        left: `calc(0% + ${leftPx}px)`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      } as React.CSSProperties
    })
  }, [number, angle, minDelay, maxDelay, minDuration, maxDuration])

  // Keep state out of effects to satisfy react-hooks/set-state-in-effect
  const [meteorStyles] = useState<Array<React.CSSProperties>>(() => styles)

  useEffect(() => {
    // no-op: styles are derived via useMemo
  }, [])

  return (
    <>
      {[...meteorStyles].map((style, idx) => (
        <span
          key={idx}
          style={{ ...style }}
          className={cn(
            "animate-meteor pointer-events-none absolute size-0.5 rotate-(--angle) rounded-full bg-zinc-500 shadow-[0_0_0_1px_#ffffff10]",
            className
          )}
        >
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-12.5 -translate-y-1/2 bg-linear-to-r from-zinc-500 to-transparent" />
        </span>
      ))}
    </>
  )
}

