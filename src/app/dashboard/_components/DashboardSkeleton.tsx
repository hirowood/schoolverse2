const SkeletonCard = () => <div className="h-40 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-700/60" />;

export function DashboardSkeleton({ variant = "full" }: { variant?: "full" | "partial" }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="h-16 w-2/3 animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-700/60" />
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <SkeletonCard />
          {variant === "full" && <SkeletonCard />}
          {variant === "full" && <SkeletonCard />}
        </div>
      </div>
      {variant === "full" && <SkeletonCard />}
    </main>
  );
}
