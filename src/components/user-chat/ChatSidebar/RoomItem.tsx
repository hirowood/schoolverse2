import type { ChatRoom } from "@/features/user-chat/types";
import { OnlineIndicator } from "@/components/user-chat/shared/OnlineIndicator";
import { UnreadBadge } from "@/components/user-chat/shared/UnreadBadge";

type Props = {
  room: ChatRoom & { unreadCount?: number };
  isActive: boolean;
  onClick: () => void;
  primaryStatus?: "online" | "away" | "offline";
};

export function RoomItem({ room, isActive, onClick, primaryStatus = "offline" }: Props) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full flex-col rounded-lg border px-3 py-2 text-left shadow-sm transition ${
        isActive ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <OnlineIndicator status={primaryStatus} size="sm" />
          <p className="line-clamp-1 text-sm font-semibold">
            {room.title || (room.type === "dm" ? "ダイレクト" : "グループ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UnreadBadge count={room.unreadCount ?? 0} />
          <span className="text-[10px] uppercase">{room.type}</span>
        </div>
      </div>
      {room.lastMessage && (
        <p className={`line-clamp-1 text-xs ${isActive ? "text-slate-200" : "text-slate-600"}`}>
          {room.lastMessage.content}
        </p>
      )}
    </button>
  );
}
