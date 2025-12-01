"use client";

import type { NodeProps } from "reactflow";
import type { MindMapNodeData } from "@/lib/mindmap/types";

export default function MindMapNode({ data, selected }: NodeProps<MindMapNodeData>) {
  const { label, description, backgroundColor, borderColor, textColor, fontSize, shape } = data;

  const borderRadius =
    shape === "ellipse"
      ? "9999px"
      : shape === "rectangle"
      ? "6px"
      : shape === "diamond"
      ? "0px"
      : "12px";

  return (
    <div
      style={{
        backgroundColor,
        border: `2px solid ${borderColor}`,
        color: textColor,
        borderRadius,
        transform: shape === "diamond" ? "rotate(45deg)" : "none",
        minWidth: 120,
        minHeight: 48,
        boxShadow: selected ? "0 0 0 3px rgba(59,130,246,0.3)" : "none",
      }}
      className="px-3 py-2 text-sm leading-tight"
    >
      <div
        className="font-semibold text-center"
        style={{
          fontSize,
          transform: shape === "diamond" ? "rotate(-45deg)" : "none",
        }}
      >
        {label}
      </div>
      {description && (
        <div
          className="mt-1 text-xs opacity-80 text-center"
          style={{ transform: shape === "diamond" ? "rotate(-45deg)" : "none" }}
        >
          {description}
        </div>
      )}
    </div>
  );
}
