import type { UserStatus } from "@/features/user-chat/types";

type Props = {
  status: UserStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
};

const statusConfig: Record<UserStatus, { color: string; label: string; ring: string }> = {
  online: { color: "bg-emerald-500", label: "オンライン", ring: "ring-emerald-500/30" },
  away: { color: "bg-amber-500", label: "離席中", ring: "ring-amber-500/30" },
  offline: { color: "bg-slate-400", label: "オフライン", ring: "ring-slate-400/30" },
};

const sizeConfig = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export function OnlineIndicator({ status, size = "md", showLabel = false }: Props) {
  const cfg = statusConfig[status];
  const sizeClass = sizeConfig[size];
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-block rounded-full ${cfg.color} ${sizeClass} ring-2 ${cfg.ring}`}
        title={cfg.label}
      />
      {showLabel && <span className="text-xs text-slate-600">{cfg.label}</span>}
    </div>
  );
}
