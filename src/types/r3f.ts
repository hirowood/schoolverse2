/* eslint-disable @typescript-eslint/no-namespace */
import type { ThreeElements } from "@react-three/fiber";

// Extend JSX to recognize Three.js intrinsic elements used by @react-three/fiber.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      [key: string]: unknown;
    }
  }
}

export {};
