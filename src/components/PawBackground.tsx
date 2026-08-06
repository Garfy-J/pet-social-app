import type { CSSProperties } from "react";
import { PawIcon } from "./PawIcon";

const COLORS = ["text-primary", "text-secondary", "text-accent"] as const;

const PAWS = [
  { top: "8%", left: "10%", size: 48, opacity: 0.12, duration: "22s", delay: "0s", rotate: -12 },
  { top: "18%", left: "80%", size: 64, opacity: 0.1, duration: "26s", delay: "2s", rotate: 20 },
  { top: "52%", left: "6%", size: 40, opacity: 0.14, duration: "19s", delay: "4s", rotate: 8 },
  { top: "66%", left: "86%", size: 56, opacity: 0.1, duration: "24s", delay: "1s", rotate: -20 },
  { top: "34%", left: "46%", size: 36, opacity: 0.08, duration: "30s", delay: "3s", rotate: 15 },
  { top: "84%", left: "34%", size: 50, opacity: 0.12, duration: "21s", delay: "5s", rotate: -8 },
  { top: "4%", left: "52%", size: 44, opacity: 0.09, duration: "27s", delay: "6s", rotate: 25 },
] as const;

export function PawBackground({
  variant = "full",
}: {
  variant?: "full" | "compact";
}) {
  const paws = variant === "compact" ? PAWS.slice(0, 4) : PAWS;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {paws.map((paw, i) => (
        <PawIcon
          key={i}
          className={`animate-paw-float absolute ${COLORS[i % COLORS.length]}`}
          style={
            {
              top: paw.top,
              left: paw.left,
              width: paw.size,
              height: paw.size,
              opacity: paw.opacity,
              animationDuration: paw.duration,
              animationDelay: paw.delay,
              "--paw-rotate": `${paw.rotate}deg`,
              transform: `rotate(${paw.rotate}deg)`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
