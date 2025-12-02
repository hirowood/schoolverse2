"use client";

import { useEffect, useState } from "react";
import MindMapCanvas from "@/components/mindmap/MindMapCanvas";
import type { MindMapEdge, MindMapNode, MindMapState } from "@/lib/mindmap/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default function MindMapDetailPage({ params }: Props) {
  const [initialState, setInitialState] = useState<Partial<MindMapState> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMindMap = async () => {
      try {
        const { id } = await params;
        const res = await fetch(`/api/mindmap/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch mind map");
        }
        const data = await res.json();
        const map = data.mindMap;

        const nodes: MindMapNode[] = (map.nodes ?? []).map((node: any) => ({
          id: node.id,
          type: (node.type as MindMapNode["type"]) ?? "mindMapNode",
          position: {
            x: node.positionX ?? 0,
            y: node.positionY ?? 0,
          },
          data: {
            label: node.label ?? "",
            description: node.description ?? "",
            backgroundColor: node.backgroundColor ?? "#ffffff",
            borderColor: node.borderColor ?? "#e2e8f0",
            textColor: node.textColor ?? "#1e293b",
            fontSize: node.fontSize ?? 14,
            shape: (node.shape as MindMapNode["data"]["shape"]) ?? "rounded",
            level: node.level ?? 0,
            isCollapsed: node.isCollapsed ?? false,
            linkedNoteId: node.linkedNoteId ?? undefined,
          },
        }));

        const edges: MindMapEdge[] = (map.edges ?? []).map((edge: any) => ({
          id: edge.id,
          source: edge.sourceId,
          target: edge.targetId,
          type: (edge.type as MindMapEdge["type"]) ?? "smoothstep",
          data: {
            strokeColor: edge.strokeColor ?? "#94a3b8",
            strokeWidth: edge.strokeWidth ?? 2,
            animated: edge.animated ?? false,
            label: edge.label ?? undefined,
          },
        }));

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
        setError(e instanceof Error ? e.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    void fetchMindMap();
  }, [params]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-600 dark:text-slate-300">
        Loading...
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
          <p className="text-xs text-slate-500 dark:text-slate-400">Mind map editor</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{initialState?.title}</h1>
        </div>
      </div>

      <MindMapCanvas initialState={initialState ?? undefined} />
    </div>
  );
}
