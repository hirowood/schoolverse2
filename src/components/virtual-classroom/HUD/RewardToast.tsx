"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  isCorrect: boolean;
  monsterName?: string | null;
  xp: number;
  bonusXp: number;
  coins: number;
  onClose: () => void;
  soundEnabled?: boolean;
};

const formatNum = (v: number) => v.toLocaleString("ja-JP");

export function RewardToast({
  open,
  isCorrect,
  monsterName,
  xp,
  bonusXp,
  coins,
  onClose,
  soundEnabled = true,
}: Props) {
  const [displayXp, setDisplayXp] = useState(0);
  const [displayBonus, setDisplayBonus] = useState(0);
  const [displayCoins, setDisplayCoins] = useState(0);
  const [prefersReduceMotion, setPrefersReduceMotion] = useState(false);

  // reduce motion 判定
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // 数字カウントアップ
  useEffect(() => {
    if (!open) return;

    // reduce motion の場合は1フレーム後に即時反映
    if (prefersReduceMotion) {
      const id = requestAnimationFrame(() => {
        setDisplayXp(xp);
        setDisplayBonus(bonusXp);
        setDisplayCoins(coins);
      });
      return () => cancelAnimationFrame(id);
    }

    const animate = (target: number, setter: (v: number) => void, duration = 600) => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        setter(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    animate(xp, setDisplayXp);
    animate(bonusXp, setDisplayBonus);
    animate(coins, setDisplayCoins, 700);
  }, [open, xp, bonusXp, coins, prefersReduceMotion]);

  // サウンド演出
  useEffect(() => {
    if (!open || !soundEnabled || prefersReduceMotion) return;
    if (typeof window === "undefined") return;
    const ctx = new AudioContext();
    const playTone = (freq: number, duration: number, delay = 0) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    };
    if (isCorrect) {
      playTone(880, 0.18);
      playTone(1180, 0.15, 0.15);
    } else {
      playTone(220, 0.25);
    }
    return () => {
      ctx.close().catch(() => undefined);
    };
  }, [open, isCorrect, soundEnabled, prefersReduceMotion]);

  const accent = isCorrect ? "emerald" : "amber";

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
      }`}
      aria-live="polite"
    >
      <div
        className={`relative w-80 rounded-2xl border shadow-xl ${
          accent === "emerald"
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="pointer-events-none absolute -top-2 left-3 flex gap-1">
          <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
          <span className="h-2 w-2 animate-ping rounded-full bg-sky-400" style={{ animationDelay: "120ms" }} />
          <span className="h-2 w-2 animate-ping rounded-full bg-amber-400" style={{ animationDelay: "240ms" }} />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Battle Result</p>
            <p className="text-base font-bold text-slate-900">
              {isCorrect ? "勝利！" : "失敗"}
            </p>
            {monsterName && <p className="text-sm text-slate-700">{monsterName}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/70 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
          >
            閉じる
          </button>
        </div>
        <div className="grid grid-cols-3 border-t border-white/70 text-center text-sm font-semibold text-slate-800">
          <div className="px-2 py-2">
            <p className="text-[11px] uppercase text-slate-500">XP</p>
            <p className="animate-pulse text-emerald-700" aria-label={`XP ${displayXp}`}>
              {formatNum(displayXp)}
            </p>
          </div>
          <div className="border-l border-white/70 px-2 py-2">
            <p className="text-[11px] uppercase text-slate-500">Bonus</p>
            <p className="text-emerald-600" aria-label={`Bonus XP ${displayBonus}`}>
              +{formatNum(displayBonus)}
            </p>
          </div>
          <div className="border-l border-white/70 px-2 py-2">
            <p className="text-[11px] uppercase text-slate-500">Coins</p>
            <p className={`text-amber-700 ${isCorrect ? "animate-pulse" : ""}`} aria-label={`Coins ${displayCoins}`}>
              {formatNum(displayCoins)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
