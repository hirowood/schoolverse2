type Props = {
  count: number;
};

export function UnreadBadge({ count }: Props) {
  if (count <= 0) return null;
  const display = count > 99 ? "99+" : count;
  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
      {display}
    </span>
  );
}
