"use client";

type Props = {
  playerCount: number;
  isConnected: boolean;
};

export function PlayerCountIndicator({ playerCount, isConnected }: Props) {
  return (
    <div className="absolute right-3 bottom-3 z-20 flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 shadow-lg ring-1 ring-slate-200 backdrop-blur">
      <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
      <span className="text-sm font-semibold text-slate-700">{playerCount} 人がオンライン</span>
    </div>
  );
}
