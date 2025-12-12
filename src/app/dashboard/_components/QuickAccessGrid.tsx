const LINKS = [
  { href: "/coach", label: "Coach", icon: "CO" },
  { href: "/notes", label: "Note", icon: "NT" },
  { href: "/user-chat", label: "Chat", icon: "CH" },
  { href: "/mindmap", label: "Mind", icon: "MM" },
  { href: "/plan", label: "Plan", icon: "PL" },
  { href: "/learning-chat", label: "Learn", icon: "LR" },
  { href: "/curriculum-map", label: "Skill", icon: "SK" },
  { href: "/report", label: "Report", icon: "RP" },
];

export function QuickAccessGrid() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900">クイックアクセス</h3>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">mobile</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-bold text-white">
              {link.icon}
            </span>
            <span className="text-center">{link.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
