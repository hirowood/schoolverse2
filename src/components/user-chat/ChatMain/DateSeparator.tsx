type Props = {
  date: Date;
};

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "今日";
  if (date.toDateString() === yesterday.toDateString()) return "昨日";

  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

export function DateSeparator({ date }: Props) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex-1 border-t border-slate-200" />
      <span className="text-xs font-medium text-slate-500">{formatDate(date)}</span>
      <div className="flex-1 border-t border-slate-200" />
    </div>
  );
}
