import type { MindMapEdge, MindMapNode } from "./types";

export interface LayoutResult {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export function autoLayout(nodes: MindMapNode[], edges: MindMapEdge[]): LayoutResult {
  // TODO: dagreによる自動レイアウト実装
  return { nodes, edges };
}
