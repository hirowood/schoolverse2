"use client";

import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: Props) {
  return (
    <div
      className={cardClassName({
        variant: "subtle",
        radius: "xl",
        padding: "lg",
        className: "flex h-full flex-col items-center justify-center gap-2 text-center border-dashed",
      })}
    >
      <p className="text-base font-semibold text-slate-800">{title}</p>
      {description && <p className="text-sm text-slate-500">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="outline" size="tap" className="mt-2 rounded-full" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

