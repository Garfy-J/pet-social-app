"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { PawIcon } from "./PawIcon";

const BURST_PAWS = [
  { tx: "-18px", ty: "-24px", size: 14 },
  { tx: "18px", ty: "-24px", size: 12 },
  { tx: "0px", ty: "-30px", size: 16 },
  { tx: "-26px", ty: "2px", size: 10 },
  { tx: "26px", ty: "2px", size: 10 },
] as const;

export function LikeButton({ liked, count }: { liked: boolean; count: number }) {
  const [burst, setBurst] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="submit"
        onClick={() => {
          if (!liked) {
            setBurst(true);
            window.setTimeout(() => setBurst(false), 650);
          }
        }}
        className={`flex items-center gap-1 font-bold transition-transform hover:scale-110 ${
          liked ? "text-primary" : "text-foreground/40"
        }`}
      >
        {liked ? "♥" : "♡"} {count}
      </button>

      {burst && (
        <span className="pointer-events-none absolute left-1/2 top-1/2">
          {BURST_PAWS.map((paw, i) => (
            <PawIcon
              key={i}
              className="absolute animate-paw-burst text-primary"
              style={
                {
                  top: 0,
                  left: 0,
                  width: paw.size,
                  height: paw.size,
                  "--tx": paw.tx,
                  "--ty": paw.ty,
                } as CSSProperties
              }
            />
          ))}
        </span>
      )}
    </span>
  );
}
