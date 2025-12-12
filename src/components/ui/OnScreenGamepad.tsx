"use client";

import type { PointerEvent } from "react";
import { cn } from "@/lib/cn";

/**
 * OnScreenGamepad
 *
 * モバイル向けの「画面内ゲームパッド」（十字キー + A/B）です。
 * Virtual Classroom のような3D/2Dビューで、タップしやすい操作UIを重ねたい時に使えます。
 *
 * - 入力は `onDirectionPress` / `onActionPress` で受け取ります（押下/離脱の boolean を渡します）。
 * - スタイルは Tailwind のデフォルトを持ちつつ、`className` や各種 *ClassName で上書きできます。
 *
 * 使い方例（オーバーレイとして配置）:
 * ```tsx
 * <div className="pointer-events-none absolute inset-0">
 *   <OnScreenGamepad
 *     className="pointer-events-auto absolute bottom-24 left-4 sm:hidden"
 *     onDirectionPress={(dir, down) => {
 *       if (down) console.log("move", dir);
 *     }}
 *   />
 * </div>
 * ```
 */

export type OnScreenGamepadDirection = "up" | "down" | "left" | "right";
export type OnScreenGamepadAction = "a" | "b";

type Props = {
  className?: string;
  showActions?: boolean;
  onDirectionPress?: (direction: OnScreenGamepadDirection, pressed: boolean) => void;
  onActionPress?: (action: OnScreenGamepadAction, pressed: boolean) => void;

  // ラベル差し替え（例: "A" -> "決定"）
  actionLabels?: Partial<Record<OnScreenGamepadAction, string>>;

  // デザイン微調整用（必要な場合だけ渡す）
  dpadClassName?: string;
  directionButtonClassName?: string;
  actionsClassName?: string;
  actionButtonClassName?: string;
};

const DIRECTION_GRID_POS: Record<OnScreenGamepadDirection, string> = {
  up: "col-start-2 row-start-1",
  left: "col-start-1 row-start-2",
  right: "col-start-3 row-start-2",
  down: "col-start-2 row-start-3",
};

const DIRECTION_SYMBOL: Record<OnScreenGamepadDirection, string> = {
  up: "↑",
  left: "←",
  right: "→",
  down: "↓",
};

const DIRECTION_ARIA: Record<OnScreenGamepadDirection, string> = {
  up: "上に移動",
  left: "左に移動",
  right: "右に移動",
  down: "下に移動",
};

const ACTION_ARIA: Record<OnScreenGamepadAction, string> = {
  a: "Aボタン",
  b: "Bボタン",
};

function safeSetPointerCapture(event: PointerEvent<HTMLButtonElement>) {
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
    // iOS Safari など、状況によっては失敗するため握りつぶす
  }
}

function safeReleasePointerCapture(event: PointerEvent<HTMLButtonElement>) {
  try {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  } catch {
    // no-op
  }
}

export function OnScreenGamepad({
  className,
  showActions = true,
  onDirectionPress,
  onActionPress,
  actionLabels,
  dpadClassName,
  directionButtonClassName,
  actionsClassName,
  actionButtonClassName,
}: Props) {
  const handleDirectionDown = (direction: OnScreenGamepadDirection) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    safeSetPointerCapture(event);
    onDirectionPress?.(direction, true);
  };

  const handleDirectionUp = (direction: OnScreenGamepadDirection) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    safeReleasePointerCapture(event);
    onDirectionPress?.(direction, false);
  };

  const handleDirectionCancel =
    (direction: OnScreenGamepadDirection) => (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      safeReleasePointerCapture(event);
      onDirectionPress?.(direction, false);
    };

  const handleDirectionLeave =
    (direction: OnScreenGamepadDirection) => (event: PointerEvent<HTMLButtonElement>) => {
      // pointer capture が効いている場合、離脱で解除すると「押しっぱなし」判定が崩れるので何もしない
      try {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) return;
      } catch {
        // no-op
      }
      onDirectionPress?.(direction, false);
    };

  const handleActionDown = (action: OnScreenGamepadAction) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    safeSetPointerCapture(event);
    onActionPress?.(action, true);
  };

  const handleActionUp = (action: OnScreenGamepadAction) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    safeReleasePointerCapture(event);
    onActionPress?.(action, false);
  };

  const handleActionCancel = (action: OnScreenGamepadAction) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    safeReleasePointerCapture(event);
    onActionPress?.(action, false);
  };

  const handleActionLeave = (action: OnScreenGamepadAction) => (event: PointerEvent<HTMLButtonElement>) => {
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) return;
    } catch {
      // no-op
    }
    onActionPress?.(action, false);
  };

  return (
    <div className={cn("flex gap-4", className)} aria-label="画面内コントローラ">
      <div className={cn("grid h-36 w-36 grid-cols-3 grid-rows-3 gap-1", dpadClassName)}>
        {(Object.keys(DIRECTION_GRID_POS) as OnScreenGamepadDirection[]).map((direction) => (
          <button
            key={direction}
            type="button"
            aria-label={DIRECTION_ARIA[direction]}
            className={cn(
              DIRECTION_GRID_POS[direction],
              "touch-none select-none rounded-full bg-white/90 text-2xl font-bold text-slate-700 shadow ring-1 ring-slate-300 active:scale-95",
              directionButtonClassName,
            )}
            onPointerDown={handleDirectionDown(direction)}
            onPointerUp={handleDirectionUp(direction)}
            onPointerCancel={handleDirectionCancel(direction)}
            onPointerLeave={handleDirectionLeave(direction)}
          >
            {DIRECTION_SYMBOL[direction]}
          </button>
        ))}
      </div>

      {showActions && (
        <div className={cn("flex flex-col items-center gap-3", actionsClassName)}>
          <button
            type="button"
            aria-label={ACTION_ARIA.a}
            className={cn(
              "touch-none select-none h-14 w-14 rounded-full bg-emerald-500 text-lg font-bold text-white shadow ring-2 ring-emerald-200 active:scale-95",
              actionButtonClassName,
            )}
            onPointerDown={handleActionDown("a")}
            onPointerUp={handleActionUp("a")}
            onPointerCancel={handleActionCancel("a")}
            onPointerLeave={handleActionLeave("a")}
          >
            {actionLabels?.a ?? "A"}
          </button>
          <button
            type="button"
            aria-label={ACTION_ARIA.b}
            className={cn(
              "touch-none select-none h-14 w-14 rounded-full bg-amber-500 text-lg font-bold text-white shadow ring-2 ring-amber-200 active:scale-95",
              actionButtonClassName,
            )}
            onPointerDown={handleActionDown("b")}
            onPointerUp={handleActionUp("b")}
            onPointerCancel={handleActionCancel("b")}
            onPointerLeave={handleActionLeave("b")}
          >
            {actionLabels?.b ?? "B"}
          </button>
        </div>
      )}
    </div>
  );
}
