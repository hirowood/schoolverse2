"use client";

import { useMemo } from "react";

type Props = {
  active: boolean;
};

const COLORS = ["#22c55e", "#f97316", "#06b6d4", "#8b5cf6", "#facc15"];

type ConfettiPiece = {
  key: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotation: number;
};

export function ConfettiEffect({ active }: Props) {
  const pieces = useMemo<ConfettiPiece[]>(() => {
    if (!active) return [];
    return Array.from({ length: 30 }, (_, i) => {
      const rand = (seed: number) => Math.abs(Math.sin(seed * 9999 + i * 31.7));
      const left = rand(1 + i) * 100;
      const delay = rand(2 + i) * 0.6;
      const duration = 2 + rand(3 + i) * 1.5;
      const size = 6 + rand(4 + i) * 6;
      const rotation = rand(5 + i) * 360;
      const color = COLORS[i % COLORS.length];
      return { key: i, left, delay, duration, size, color, rotation };
    });
  }, [active]);

  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((item) => (
        <span
          key={item.key}
          className="absolute animate-[vc-confetti_fall_linear_forwards]"
          style={{
            left: `${item.left}%`,
            top: "-10px",
            width: `${item.size}px`,
            height: `${item.size * 1.6}px`,
            backgroundColor: item.color,
            transform: `rotate(${item.rotation}deg)`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            opacity: 0.9,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes vc-confetti {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 110vh, 0) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-[vc-confetti_fall_linear_forwards] {
          animation-name: vc-confetti;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}
