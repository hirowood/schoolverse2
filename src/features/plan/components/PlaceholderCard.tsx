"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

type Props = {
  id: string;
  label: string;
};

/**
 * Sortable placeholder so that empty lists can still accept drops.
 */
export const PlaceholderCard = ({ id, label }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-md border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-500 ${
        isDragging ? "shadow" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      {label}
    </div>
  );
};
