"use client";

import type { ChatRoom } from "@/features/user-chat/types";
import { OnlineIndicator } from "@/components/user-chat/shared/OnlineIndicator";
import { UnreadBadge } from "@/components/user-chat/shared/UnreadBadge";
import { cardClassName } from "@/components/ui/Card";

type Props = {
  room: ChatRoom & { unreadCount?: number };
  isActive: boolean;
  onClick: () => void;
  primaryStatus?: "online" | "away" | "offline";
};

export function RoomItem({ room, isActive, onClick, primaryStatus = "offline" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cardClassName({
        padding: "sm",
        radius: "xl",
        shadow: "sm",
        className: isActive
          ? "w-full border-slate-900 bg-slate-900 text-white"
          : "w-full border-slate-200 bg-white text-slate-900 transition hover:-translate-y-0.5 hover:shadow-md",
      })}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <OnlineIndicator status={primaryStatus} size="sm" />
          <p className="line-clamp-1 text-base font-semibold">
            {room.title || (room.type === "dm" ? "ダイレクト" : "グループ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UnreadBadge count={room.unreadCount ?? 0} />
          <span className={`text-xs font-semibold uppercase ${isActive ? "text-slate-200" : "text-slate-500"}`}>
            {room.type}
          </span>
        </div>
      </div>
      {room.lastMessage && (
        <p className={`mt-1 line-clamp-1 text-sm ${isActive ? "text-slate-200" : "text-slate-600"}`}>
          {room.lastMessage.content}
        </p>
      )}
    </button>
  );
}

