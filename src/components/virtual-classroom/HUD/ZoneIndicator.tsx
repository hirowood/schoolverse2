"use client";

import { useVirtualRoomStore } from "@/stores/useVirtualRoomStore";

const ZONE_NAMES: Record<string, string> = {
  frontend: "フロントエンド",
  react: "React",
  backend: "バックエンド",
  infra: "インフラ",
  fullstack: "フルスタック",
  thinking: "思考・メタ",
};

export function ZoneIndicator() {
  const zone = useVirtualRoomStore((s) => s.currentZone);
  if (!zone) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      <span>ゾーン: {ZONE_NAMES[zone.category] ?? zone.category}</span>
    </div>
  );
}
