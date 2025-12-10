import type { ChatRoom } from "@/features/user-chat/types";
import { RoomItem } from "./RoomItem";

type Props = {
  rooms: Array<ChatRoom & { unreadCount?: number }>;
  activeRoomId: string | null;
  currentUserId?: string | null;
  onSelect: (roomId: string) => void;
  getUserStatus: (userId: string) => "online" | "away" | "offline";
};

export function RoomList({ rooms, activeRoomId, currentUserId, onSelect, getUserStatus }: Props) {
  if (rooms.length === 0) {
    return <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">まだルームがありません</p>;
  }

  return (
    <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: "400px" }}>
      {rooms.map((room) => {
        const primaryMember = room.members?.find((m) => m.userId !== currentUserId) ?? room.members?.[0];
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
