"use client";

import {
  ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export interface AnimatedGridPatternProps extends ComponentPropsWithoutRef<"svg"> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: number;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
}

type Square = {
  id: number;
  pos: [number, number];
  iteration: number;
};

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  ...props
}: AnimatedGridPatternProps) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Generate initial squares in a render-safe way (no setState in effects)
  const seed = numSquares + width * 31 + height * 17;
  const rand = mulberry32(seed);

  const [squares, setSquares] = useState<Array<Square>>(() =>
    Array.from({ length: numSquares }, (_, i) => ({
      id: i,
      pos: [Math.floor(rand() * width), Math.floor(rand() * height)],
      iteration: 0,
    })),
  );

  const updateSquarePosition = useCallback(
    (squareId: number) => {
      setSquares((currentSquares) => {
        const current = currentSquares[squareId];
        if (!current || current.id !== squareId) return currentSquares;

        // Keep update deterministic relative to time by using iteration as seed input
        const nextRand = mulberry32(
          seed + current.iteration * 9973 + squareId * 101,
        );
        const nextSquares = currentSquares.slice();
        nextSquares[squareId] = {
          ...current,
          pos: [
            Math.floor((nextRand() * dimensions.width) / width),
            Math.floor((nextRand() * dimensions.height) / height),
          ],
          iteration: current.iteration + 1,
        };
        return nextSquares;
      });
    },
    [seed, dimensions.width, dimensions.height, width, height],
  );



  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [squareX, squareY], id, iteration }, index) => (
          <motion.rect
            key={`${id}-${iteration}-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: 1,
              delay: index * 0.1,
              repeatType: "reverse",
              repeatDelay,
            }}
            onAnimationComplete={() => updateSquarePosition(id)}
            width={width - 1}
            height={height - 1}
            x={squareX * width + 1}
            y={squareY * height + 1}
            fill="currentColor"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  );
}
