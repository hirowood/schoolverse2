"use client";

import { useEffect, useState } from "react";
import MindMapCanvas from "@/components/mindmap/MindMapCanvas";
import type { MindMapEdge, MindMapNode, MindMapState } from "@/lib/mindmap/types";

interface Props {
  params: { id: string };
}

export default function MindMapDetailPage({ params }: Props) {
  const [initialState, setInitialState] = useState<Partial<MindMapState> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMindMap = async () => {
      try {
        const res = await fetch(`/api/mindmap/${params.id}`);
        if (!res.ok) {
          throw new Error("マインドマップを取得できませんでした");
        }
        const data = await res.json();
        const map = data.mindMap;
        const nodes = (map.nodes ?? []) as MindMapNode[];
        const edges = (map.edges ?? []) as MindMapEdge[];
        setInitialState({
          id: map.id,
          title: map.title,
          nodes,
          edges,
          viewport: {
            x: map.viewportX ?? 0,
            y: map.viewportY ?? 0,
            zoom: map.viewportZoom ?? 1,
          },
          theme: (map.theme as MindMapState["theme"]) ?? "default",
          layoutType: (map.layoutType as MindMapState["layoutType"]) ?? "radial",
        });
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "エラーが発生しました");
      } finally {
        setLoading(false);
      }
    };
    void fetchMindMap();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-600 dark:text-slate-300">
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">マインドマップ編集</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{initialState?.title}</h1>
        </div>
      </div>

      <MindMapCanvas initialState={initialState ?? undefined} />
    </div>
  );
}
