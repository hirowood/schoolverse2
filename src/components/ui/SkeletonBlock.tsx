"use client";

interface SkeletonBlockProps {
  rows?: number;
}

export default function SkeletonBlock({ rows = 3 }: SkeletonBlockProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex animate-pulse flex-col gap-2">
          <div className="h-3 w-3/4 rounded-full bg-slate-200 opacity-70" />
          <div className="h-3 w-full rounded-full bg-slate-200 opacity-70" />
          <div className="h-3 w-5/6 rounded-full bg-slate-200 opacity-70" />
        </div>
      ))}
    </div>
  );
}
