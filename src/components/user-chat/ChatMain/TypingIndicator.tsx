import type { TypingUser } from "@/features/user-chat/types";

type Props = {
  users: TypingUser[];
};

export function TypingIndicator({ users }: Props) {
  if (users.length === 0) return null;

  const text =
    users.length === 1
      ? `${users[0].name} が入力中`
      : users.length === 2
        ? `${users[0].name} と ${users[1].name} が入力中`
        : `${users[0].name} 他${users.length - 1}人が入力中`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-slate-600">
      <div className="flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
      </div>
      <span>{text}</span>
    </div>
  );
}
