const LINKS = [
  { href: "/coach", label: "Coach", icon: "🤖" },
  { href: "/notes", label: "Note", icon: "📝" },
  { href: "/user-chat", label: "Chat", icon: "💬" },
  { href: "/mindmap", label: "Mind", icon: "🧠" },
  { href: "/plan", label: "Plan", icon: "📋" },
  { href: "/learning-chat", label: "Learn", icon: "📚" },
  { href: "/curriculum-map", label: "Skill", icon: "🗺️" },
  { href: "/report", label: "Report", icon: "📈" },
];

export function QuickAccessGrid() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">💬 クイックアクセス</h3>
      <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
