"use client";

import { ReactNode } from "react";

type Props = {
  active: boolean;
  children: ReactNode;
};

export function ShakeEffect({ active, children }: Props) {
  return (
    <div className={active ? "vc-shake" : ""}>
      {children}
      <style jsx>{`
        @keyframes vc-shake {
          0% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-6px);
          }
          40% {
            transform: translateX(6px);
          }
          60% {
            transform: translateX(-4px);
          }
          80% {
            transform: translateX(4px);
          }
          100% {
            transform: translateX(0);
          }
        }
        .vc-shake {
          animation: vc-shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
