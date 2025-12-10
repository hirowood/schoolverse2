import type { ChatRoom, ChatRoomMember } from "@/features/user-chat/types";
import { OnlineIndicator } from "@/components/user-chat/shared/OnlineIndicator";

type Props = {
  room: ChatRoom | null;
  getUserStatus: (userId: string) => "online" | "away" | "offline";
  onBack?: () => void;
};

export function ChatHeader({ room, getUserStatus, onBack }: Props) {
  return (
    <header className="border-b border-slate-200 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden"
          >
            <span aria-hidden>←</span>
            <span>戻る</span>
          </button>
        )}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Room</p>
          <h3 className="text-lg font-semibold text-slate-900">
            {room?.title || (room?.type === "dm" ? "ダイレクトメッセージ" : "グループ")}
          </h3>
        </div>
      </div>
      {room?.members && (
        <div className="mt-2 flex flex-wrap gap-2">
          {room.members.map((member) => (
            <MemberStatus key={member.id} member={member} getUserStatus={getUserStatus} />
          ))}
        </div>
      )}
    </header>
  );
}

function MemberStatus({
  member,
  getUserStatus,
}: {
  member: ChatRoomMember;
  getUserStatus: (userId: string) => "online" | "away" | "offline";
}) {
  const status = getUserStatus(member.userId);
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">
      <OnlineIndicator status={status} size="sm" />
      <span>{member.user?.name ?? member.user?.email ?? member.userId}</span>
    </span>
  );
}
