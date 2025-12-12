// Excalidrawとの相互変換ユーティリティ（暫定実装）
// バージョン差の型が混在しても扱えるよう、最低限の構造だけを型として定義する（anyは使わない）

type ExcalidrawBoundElementRef = {
  id: string;
  type: string;
};

type ExcalidrawElement = Record<string, unknown> & {
  id: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  strokeColor?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  boundElements?: ReadonlyArray<ExcalidrawBoundElementRef> | null;
  startBinding?: { elementId: string; focus?: number; gap?: number } | null;
  endBinding?: { elementId: string; focus?: number; gap?: number } | null;
  label?: string;
};
import type { MindMapEdge, MindMapNode, LayoutType } from "./types";

type ConvertOptions = {
  groupNodes?: boolean;
  convertToArrows?: boolean;
  preserveColors?: boolean;
  layoutType?: LayoutType;
};

export function mindMapToExcalidraw(
  nodes: MindMapNode[],
  edges: MindMapEdge[],
  options: ConvertOptions = {}
): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = [];
  const idMap = new Map<string, string>();
  const now = Date.now();
  const seed = () => Math.floor(Math.random() * 100000);

  nodes.forEach((node) => {
    const shapeId = crypto.randomUUID();
    idMap.set(node.id, shapeId);
    const width = node.width ?? 140;
    const height = node.height ?? 60;
    const { x, y } = node.position;
    const shapeType =
      node.data.shape === "ellipse"
        ? "ellipse"
        : node.data.shape === "diamond"
          ? "diamond"
          : "rectangle";

    const textElement: ExcalidrawElement = {
      id: crypto.randomUUID(),
      type: "text",
      x: x + 10,
      y: y + 10,
      width: width - 20,
      height: 24,
      text: node.data.label ?? "ノード",
      fontSize: node.data.fontSize ?? 14,
      fontFamily: 1,
      textAlign: "center",
      verticalAlign: "middle",
      baseline: 18,
      strokeColor: node.data.textColor ?? "#1e293b",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [],
      seed: seed(),
      version: 1,
      versionNonce: seed(),
      isDeleted: false,
      boundElements: null,
      updated: now,
      link: null,
      locked: false,
    };

    const shapeElement: ExcalidrawElement = {
      id: shapeId,
      type: shapeType,
      x,
      y,
      width,
      height,
      strokeColor: node.data.borderColor ?? "#e2e8f0",
      backgroundColor: options.preserveColors ? node.data.backgroundColor ?? "#ffffff" : "#ffffff",
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [],
      seed: seed(),
      version: 1,
      versionNonce: seed(),
      isDeleted: false,
      boundElements: [{ id: textElement.id, type: "text" }],
      updated: now,
      link: null,
      locked: false,
      roundness: shapeType === "rectangle" ? { type: 3 } : undefined,
    };

    elements.push(shapeElement, textElement);
  });

  edges.forEach((edge) => {
    const sourceElementId = idMap.get(edge.source);
    const targetElementId = idMap.get(edge.target);
    if (!sourceElementId || !targetElementId) return;

    const arrowElement: ExcalidrawElement = {
      id: crypto.randomUUID(),
      type: options.convertToArrows ? "arrow" : "line",
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      points: [
        [0, 0],
        [0, 0],
      ],
      strokeColor: edge.data?.strokeColor ?? "#94a3b8",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: edge.data?.strokeWidth ?? 2,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [],
      seed: seed(),
      version: 1,
      versionNonce: seed(),
      isDeleted: false,
      boundElements: null,
      updated: now,
      link: null,
      locked: false,
      startBinding: { elementId: sourceElementId, focus: 0, gap: 4 },
      endBinding: { elementId: targetElementId, focus: 0, gap: 4 },
      startArrowhead: null,
      endArrowhead: options.convertToArrows ? "arrow" : null,
      label: edge.data?.label ?? "",
    };

    elements.push(arrowElement);
  });

  return elements;
}

export function excalidrawToMindMap(elements: ExcalidrawElement[]): {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
} {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  const shapes = elements.filter((element) => ["rectangle", "ellipse", "diamond"].includes(element.type));
  shapes.forEach((shape, index) => {
    const boundTextId = shape.boundElements?.find((b) => b.type === "text")?.id;
    const textElement = boundTextId
      ? elements.find((element) => element.id === boundTextId)
      : elements.find(
          (element) =>
            element.type === "text" &&
            Math.abs((element.x ?? 0) - (shape.x ?? 0)) < (shape.width ?? 140) &&
            Math.abs((element.y ?? 0) - (shape.y ?? 0)) < (shape.height ?? 60),
        );

    nodes.push({
      id: shape.id,
      type: index === 0 ? "rootNode" : "mindMapNode",
      position: { x: shape.x ?? 0, y: shape.y ?? 0 },
      width: shape.width,
      height: shape.height,
      data: {
        label: textElement?.text ?? "未設定",
        description: undefined,
        backgroundColor: shape.backgroundColor ?? "#ffffff",
        borderColor: shape.strokeColor ?? "#e2e8f0",
        textColor: textElement?.strokeColor ?? "#1e293b",
        fontSize: textElement?.fontSize ?? 14,
        shape: shape.type === "ellipse" ? "ellipse" : shape.type === "diamond" ? "diamond" : "rounded",
        level: 0,
        isCollapsed: false,
      },
    });
  });

  const lines = elements.filter((element) => ["arrow", "line"].includes(element.type));
  lines.forEach((line) => {
    const startId = line.startBinding?.elementId;
    const endId = line.endBinding?.elementId;
    if (startId && endId) {
      edges.push({
        id: line.id,
        source: startId,
        target: endId,
        type: "smoothstep",
        data: {
          strokeColor: line.strokeColor ?? "#94a3b8",
          strokeWidth: line.strokeWidth ?? 2,
          animated: false,
          label: line.label,
        },
      });
    }
  });

  return { nodes, edges };
}
