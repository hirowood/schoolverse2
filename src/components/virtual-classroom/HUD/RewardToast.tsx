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
};

export function RewardToast({ open, isCorrect, monsterName, xp, bonusXp, coins, onClose }: Props) {
  const [displayXp, setDisplayXp] = useState(0);
  const [displayBonus, setDisplayBonus] = useState(0);
  const [displayCoins, setDisplayCoins] = useState(0);

  // 数字カウントアップ
  useEffect(() => {
    if (!open) return;
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
  }, [open, xp, bonusXp, coins]);

  // サウンド演出
  useEffect(() => {
    if (!open) return;
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
  }, [open, isCorrect]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`relative w-80 rounded-2xl border shadow-xl ${
          isCorrect ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="pointer-events-none absolute -top-2 left-3 flex gap-1">
          <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
          <span className="h-2 w-2 animate-ping rounded-full bg-amber-400" style={{ animationDelay: "100ms" }} />
          <span className="h-2 w-2 animate-ping rounded-full bg-blue-400" style={{ animationDelay: "200ms" }} />
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
            <p className="animate-pulse text-emerald-700">{displayXp}</p>
          </div>
          <div className="border-l border-white/70 px-2 py-2">
            <p className="text-[11px] uppercase text-slate-500">Bonus</p>
            <p className="text-emerald-600">+{displayBonus}</p>
          </div>
          <div className="border-l border-white/70 px-2 py-2">
            <p className="text-[11px] uppercase text-slate-500">Coins</p>
            <p className={`text-amber-600 ${isCorrect ? "animate-pulse" : ""}`}>{displayCoins}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
