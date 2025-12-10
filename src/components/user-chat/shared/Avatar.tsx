import type { UserStatus } from "@/features/user-chat/types";
import { OnlineIndicator } from "./OnlineIndicator";

type Props = {
  name?: string | null;
  size?: "sm" | "md" | "lg";
  status?: UserStatus;
  showStatus?: boolean;
};

const sizeConfig = {
  sm: { container: "h-8 w-8", text: "text-xs" },
  md: { container: "h-10 w-10", text: "text-sm" },
  lg: { container: "h-12 w-12", text: "text-base" },
};

const colors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-pink-500",
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ name, size = "md", status, showStatus }: Props) {
  const cfg = sizeConfig[size];
  const bg = name ? getColorFromName(name) : "bg-slate-400";
  const initials = getInitials(name);

  return (
    <div className="relative inline-block">
      <div
        className={`flex items-center justify-center rounded-full ${bg} ${cfg.container} font-semibold text-white`}
        title={name ?? undefined}
      >
        <span className={cfg.text}>{initials}</span>
      </div>
      {showStatus && status && (
        <div className="absolute -bottom-0.5 -right-0.5">
          <OnlineIndicator status={status} size="sm" />
        </div>
      )}
    </div>
  );
}
