"use client";

import { cn } from "@/lib/cn";

/**
 * ToggleSwitch
 *
 * 同じトグルUI（track + knob）の Tailwind をまとめるためのコンポーネントです。
 * - button + role="switch" を採用（フォーム input を使わず、見た目を統一しやすい）
 * - クリック/Enter/Space でトグル可能（button の標準挙動）
 *
 * 使い方例:
 *   <ToggleSwitch
 *     checked={enabled}
 *     disabled={loading}
 *     ariaLabel="ポモドーロを有効化"
 *     onToggle={toggle}
 *   />
 */

export type ToggleSwitchSize = "md" | "sm";

type Props = {
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
  ariaLabel: string;
  size?: ToggleSwitchSize;
  className?: string;
};

const SIZE: Record<ToggleSwitchSize, { track: string; knob: string; knobOn: string; knobOff: string }> = {
  md: {
    track: "h-8 w-14",
    knob: "h-7 w-7",
    knobOn: "translate-x-6",
    knobOff: "translate-x-0.5",
  },
  sm: {
    track: "h-7 w-12",
    knob: "h-6 w-6",
    knobOn: "translate-x-5",
    knobOff: "translate-x-0.5",
  },
};

export function ToggleSwitch({ checked, disabled, onToggle, ariaLabel, size = "md", className }: Props) {
  const s = SIZE[size];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2",
        s.track,
        checked ? "bg-emerald-500" : "bg-slate-200",
        disabled ? "cursor-not-allowed opacity-60" : "",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          s.knob,
          checked ? s.knobOn : s.knobOff,
        )}
      />
    </button>
  );
}

