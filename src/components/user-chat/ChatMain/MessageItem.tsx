import type { ChatRoomMessage } from "@/features/user-chat/types";
import { Avatar } from "@/components/user-chat/shared/Avatar";

type Props = {
  message: ChatRoomMessage;
  currentUserId?: string | null;
};

export function MessageItem({ message, currentUserId }: Props) {
  const isSelf = currentUserId ? message.senderId === currentUserId : false;
  const readCount = message.reads?.length ?? 0;
  const senderName = message.sender?.name ?? message.sender?.email ?? "ユーザー";

  return (
    <div className={`flex w-full ${isSelf ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[80%] items-start gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
        {!isSelf && (
          <Avatar name={senderName} size="sm" />
        )}
        <div
          className={`w-full rounded-lg px-3 py-2 shadow-sm ${
            isSelf
              ? "rounded-br-sm bg-emerald-600 text-white"
              : "rounded-bl-sm border border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500">
            <span className="font-semibold">{senderName}</span>
            <span>{new Date(message.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
          {readCount > 0 && (
            <p className="mt-1 text-[11px] text-slate-200">
              既読 {readCount}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
