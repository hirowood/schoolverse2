export function DashboardSkeleton({ variant = "full" }: { variant?: "full" | "partial" }) {
  const Card = () => <div className="h-40 animate-pulse rounded-2xl bg-slate-200/70" />;
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="h-16 w-2/3 animate-pulse rounded-lg bg-slate-200/70" />
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <Card />
          <Card />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <Card />
          {variant === "full" && <Card />}
          {variant === "full" && <Card />}
        </div>
      </div>
      {variant === "full" && <Card />}
    </main>
  );
}
