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
      <div
        className={`flex max-w-[90%] items-start gap-2 sm:max-w-[75%] ${
          isSelf ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {!isSelf && (
          <Avatar name={senderName} size="sm" />
        )}
        <div
          className={`w-full rounded-2xl px-4 py-3 shadow-sm ${
            isSelf
              ? "rounded-br-md bg-emerald-600 text-white"
              : "rounded-bl-md border border-slate-200 bg-white"
          }`}
        >
          <div className={`flex items-center justify-between gap-3 text-xs ${isSelf ? "text-emerald-50/80" : "text-slate-400"}`}>
            <span className="font-semibold">{senderName}</span>
            <span>
              {new Date(message.createdAt).toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className={`mt-2 whitespace-pre-wrap text-[15px] leading-7 ${isSelf ? "text-white" : "text-slate-900"}`}>
            {message.content}
          </div>
          {readCount > 0 && (
            <p className={`mt-2 text-xs ${isSelf ? "text-emerald-50/80" : "text-slate-400"}`}>既読 {readCount}</p>
          )}
        </div>
      </div>
    </div>
  );
}
