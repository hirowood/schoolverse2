"use client";

import type { PlayerState } from "@/hooks/useClassroomPresence";

type Props = {
  players: Map<string, PlayerState>;
};

export function OtherPlayerBattles({ players }: Props) {
  const battlingPlayers = Array.from(players.values()).filter(
    (p) => p.status === "battling" && p.currentMonster,
  );
  if (battlingPlayers.length === 0) return null;

  return (
    <div className="absolute left-3 top-16 z-20 space-y-2">
      {battlingPlayers.map((player) => (
        <div
          key={player.userId}
          className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 shadow ring-1 ring-red-200"
        >
          <span
            className="h-3 w-3 rounded-full animate-pulse"
            style={{ backgroundColor: player.avatarColor }}
          />
          <span className="text-xs font-semibold text-slate-700">{player.userName}</span>
          <span className="text-xs text-red-600">vs {player.currentMonster}</span>
        </div>
      ))}
    </div>
  );
}
