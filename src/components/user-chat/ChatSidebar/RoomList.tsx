"use client";

import type { ChatRoom } from "@/features/user-chat/types";
import { RoomItem } from "./RoomItem";
import { cardClassName } from "@/components/ui/Card";

type Props = {
  rooms: Array<ChatRoom & { unreadCount?: number }>;
  activeRoomId: string | null;
  currentUserId?: string | null;
  onSelect: (roomId: string) => void;
  getUserStatus: (userId: string) => "online" | "away" | "offline";
};

export function RoomList({ rooms, activeRoomId, currentUserId, onSelect, getUserStatus }: Props) {
  if (rooms.length === 0) {
    return (
      <p
        className={cardClassName({
          variant: "subtle",
          padding: "sm",
          radius: "lg",
          className: "border-dashed text-sm text-slate-500",
        })}
      >
        まだルームがありません
      </p>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: "440px" }}>
      {rooms.map((room) => {
        const primaryMember =
          room.members?.find((m) => m.userId !== currentUserId) ?? room.members?.[0];
        const status = primaryMember ? getUserStatus(primaryMember.userId) : "offline";
        return (
          <RoomItem
            key={room.id}
            room={room}
            isActive={activeRoomId === room.id}
            onClick={() => onSelect(room.id)}
            primaryStatus={status}
          />
        );
      })}
    </div>
  );
}

