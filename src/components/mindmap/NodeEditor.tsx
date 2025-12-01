"use client";

import { useEffect, useState } from "react";
import type { MindMapNodeData } from "@/lib/mindmap/types";

type ShapeOption = MindMapNodeData["shape"];

interface NodeEditorProps {
  open: boolean;
  nodeId: string | null;
  data: MindMapNodeData | null;
  onSave: (data: Partial<MindMapNodeData>) => void;
  onClose: () => void;
}

export default function NodeEditor({ open, nodeId, data, onSave, onClose }: NodeEditorProps) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [borderColor, setBorderColor] = useState("#e2e8f0");
  const [textColor, setTextColor] = useState("#1e293b");
  const [fontSize, setFontSize] = useState(14);
  const [shape, setShape] = useState<ShapeOption>("rounded");

  useEffect(() => {
    if (data) {
      setLabel(data.label ?? "");
      setDescription(data.description ?? "");
      setBackgroundColor(data.backgroundColor ?? "#ffffff");
      setBorderColor(data.borderColor ?? "#e2e8f0");
      setTextColor(data.textColor ?? "#1e293b");
      setFontSize(data.fontSize ?? 14);
      setShape(data.shape ?? "rounded");
    }
  }, [data]);

  if (!open || !nodeId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl dark:bg-slate-800 dark:text-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">ノード編集</p>
            <h3 className="text-lg font-semibold">選択ノード: {data?.label ?? nodeId}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-700 dark:text-slate-200">ラベル</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700 dark:text-slate-200">説明（任意）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-200">背景色</label>
              <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="ml-2 h-8 w-16" />
            </div>
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-200">枠線色</label>
              <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="ml-2 h-8 w-16" />
            </div>
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-200">文字色</label>
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="ml-2 h-8 w-16" />
            </div>
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-200">フォントサイズ</label>
              <input
                type="number"
                min={10}
                max={32}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value) || 14)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-700 dark:text-slate-200">形状</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {(["rounded", "rectangle", "ellipse", "diamond"] as ShapeOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setShape(opt)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    shape === opt
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100"
                      : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-200"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            キャンセル
          </button>
          <button
            onClick={() =>
              onSave({
                label,
                description,
                backgroundColor,
                borderColor,
                textColor,
                fontSize,
                shape,
              })
            }
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
