"use client";

import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

/**
 * 汎用ボタンコンポーネント。
 *
 * - Tailwind の className 重複を減らすために、variant/size/rounded を props で切り替えます。
 * - 同じボタン体系が複数画面に出る場合は、この Button を使うのが推奨です。
 * - 画面固有の色や細かい調整は `className` で上書きできます。
 *
 * 使い方例:
 *   <Button variant="outline" size="tap" onClick={...}>編集</Button>
 *   <Button variant="solid" color="amber" size="tap">進行中</Button>
 *   <Link className={buttonClassName({ variant:"outline", rounded:"full", size:"chipXs" })} ... />
 */

export type ButtonVariant = "solid" | "outline" | "soft";
export type ButtonColor = "slate" | "amber" | "blue" | "emerald" | "purple" | "red";
export type ButtonSize = "tap" | "tapXs" | "chip" | "chipXs";
export type ButtonRounded = "md" | "full";

const BASE =
  "inline-flex items-center justify-center font-medium transition disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

// モバイル優先のサイズ（sm 以上で従来の小さめサイズに戻す）
const SIZE: Record<ButtonSize, string> = {
  tap: "px-3 py-2 text-sm sm:px-2 sm:py-1 sm:text-xs",
  tapXs: "px-3 py-2 text-xs sm:px-2 sm:py-1 sm:text-[11px]",
  chip: "px-3 py-2 text-sm sm:py-1 sm:text-xs",
  chipXs: "px-3 py-2 text-xs sm:py-1 sm:text-[11px]",
};

const ROUNDED: Record<ButtonRounded, string> = {
  md: "rounded-md",
  full: "rounded-full",
};

const VARIANT: Record<ButtonVariant, Record<ButtonColor, string>> = {
  solid: {
    slate: "bg-slate-900 text-white hover:bg-slate-800",
    amber: "bg-amber-500 text-white hover:bg-amber-600",
    blue: "bg-blue-500 text-white hover:bg-blue-600",
    emerald: "bg-emerald-600 text-white hover:bg-emerald-700",
    purple: "bg-purple-600 text-white hover:bg-purple-700",
    red: "bg-red-600 text-white hover:bg-red-700",
  },
  outline: {
    slate:
      "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-500 dark:text-slate-300 dark:hover:border-slate-400",
    amber: "border border-slate-300 text-slate-700 hover:bg-slate-100",
    blue: "border border-slate-300 text-slate-700 hover:bg-slate-100",
    emerald:
      "border border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30",
    purple: "border border-slate-300 text-slate-700 hover:bg-slate-100",
    red:
      "border border-red-200 text-red-600 hover:border-red-400 dark:border-red-400 dark:text-red-400",
  },
  soft: {
    slate: "border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100",
    amber: "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
    blue:
      "border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50",
    emerald: "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    purple:
      "border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-500 dark:bg-purple-900/30 dark:text-purple-300",
    red: "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
  },
};

export function buttonClassName({
  variant = "outline",
  color = "slate",
  size = "tap",
  rounded = "md",
  className,
}: {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  rounded?: ButtonRounded;
  className?: string;
}) {
  return cn(BASE, SIZE[size], ROUNDED[rounded], VARIANT[variant][color], className);
}

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  rounded?: ButtonRounded;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "outline",
      color = "slate",
      size = "tap",
      rounded = "md",
      className,
      type,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      // type 未指定時に submit にならないよう明示
      type={type ?? "button"}
      className={buttonClassName({ variant, color, size, rounded, className })}
      {...props}
    />
  ),
);

Button.displayName = "Button";
