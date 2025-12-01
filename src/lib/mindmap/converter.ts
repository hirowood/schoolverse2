import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { MindMapEdge, MindMapNode } from "./types";

interface ConvertOptions {
  groupNodes?: boolean;
  convertToArrows?: boolean;
  preserveColors?: boolean;
}

export function mindMapToExcalidraw(
  nodes: MindMapNode[],
  edges: MindMapEdge[],
  options: ConvertOptions = {}
): ExcalidrawElement[] {
  // TODO: 本実装（設計書参照）。現状は空配列で返す。
  void nodes;
  void edges;
  void options;
  return [];
}

export function excalidrawToMindMap(elements: ExcalidrawElement[]): {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
} {
  // TODO: 本実装（設計書参照）。現状は空配列で返す。
  void elements;
  return { nodes: [], edges: [] };
}
