import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Card
 *
 * よくある「白背景 + 枠線 + 角丸 + 影」の塊を共通化するためのUIプリミティブです。
 * Tailwind の同じ className が増えがちな箇所を、variant/size でまとめます。
 *
 * 使い方例:
 *   <Card>...</Card>
 *   <section className={cardClassName({ className: "space-y-3" })}>...</section>
 */

export type CardVariant = "surface" | "subtle" | "glass";
export type CardPadding = "none" | "sm" | "md" | "lg" | "board";
export type CardRadius = "lg" | "xl" | "2xl";
export type CardShadow = "none" | "sm" | "md";

const VARIANT: Record<CardVariant, string> = {
  // 通常のカード
  surface: "border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800",
  // 一段下のカード（一覧内アイテムなど）
  subtle: "border border-slate-100 bg-slate-50 dark:border-slate-600 dark:bg-slate-700",
  // 透明度 + ぼかし（HUD/オーバーレイなど）
  glass: "border border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80",
};

const PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  // タスクボードなどでよく使うレスポンシブ余白
  board: "p-3 sm:p-4",
};

const RADIUS: Record<CardRadius, string> = {
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

const SHADOW: Record<CardShadow, string> = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
};

export function cardClassName({
  variant = "surface",
  padding = "md",
  radius = "xl",
  shadow = "sm",
  className,
}: {
  variant?: CardVariant;
  padding?: CardPadding;
  radius?: CardRadius;
  shadow?: CardShadow;
  className?: string;
}) {
  return cn(RADIUS[radius], VARIANT[variant], SHADOW[shadow], PADDING[padding], className);
}

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
  radius?: CardRadius;
  shadow?: CardShadow;
};

export function Card({ variant, padding, radius, shadow, className, ...props }: CardProps) {
  return (
    <div
      className={cardClassName({
        variant,
        padding,
        radius,
        shadow,
        className,
      })}
      {...props}
    />
  );
}

