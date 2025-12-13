import type { ChatRoom, ChatRoomMember } from "@/features/user-chat/types";
import { OnlineIndicator } from "@/components/user-chat/shared/OnlineIndicator";
import { Button } from "@/components/ui/Button";

type Props = {
  room: ChatRoom | null;
  getUserStatus: (userId: string) => "online" | "away" | "offline";
  onBack?: () => void;
};

export function ChatHeader({ room, getUserStatus, onBack }: Props) {
  const title = room
    ? room.title || (room.type === "dm" ? "ダイレクトメッセージ" : "グループ")
    : "ルームを選択";

  return (
    <header className="border-b border-slate-200 px-6 py-4">
      <div className="flex flex-wrap items-center gap-3">
        {onBack && (
          <Button
            onClick={onBack}
            size="tap"
            variant="outline"
            rounded="full"
            className="gap-1 lg:hidden"
          >
            <span aria-hidden>←</span>
            <span>ルーム一覧</span>
          </Button>
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Room</p>
          <h3 className="text-xl font-semibold text-slate-900">
            {title}
          </h3>
        </div>
      </div>
      {room?.members && (
        <div className="mt-3 flex flex-wrap gap-2">
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
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
      <OnlineIndicator status={status} size="sm" />
      <span>{member.user?.name ?? member.user?.email ?? member.userId}</span>
    </span>
  );
}
