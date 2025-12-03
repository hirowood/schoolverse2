import dagre from "dagre";
import type { MindMapEdge, MindMapNode, LayoutType } from "./types";

export interface LayoutResult {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

interface LayoutOptions {
  layoutType?: LayoutType;
}

export function layoutMindMap(nodes: MindMapNode[], edges: MindMapEdge[], options: LayoutOptions = {}): LayoutResult {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: toRankDir(options.layoutType ?? "radial"),
    nodesep: 80,
    edgesep: 20,
    ranksep: 120,
  });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    const width = node.width ?? 180;
    const height = node.height ?? 60;
    g.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const laidOutNodes = nodes.map((node) => {
    const dagNode = g.node(node.id);
    if (!dagNode) return node;
    return {
      ...node,
      position: {
        x: dagNode.x - (dagNode.width ?? 0) / 2,
        y: dagNode.y - (dagNode.height ?? 0) / 2,
      },
    };
  });

  return { nodes: laidOutNodes, edges };
}

function toRankDir(layout: LayoutType): "LR" | "RL" | "TB" | "BT" {
  switch (layout) {
    case "horizontal":
      return "LR";
    case "tree":
      return "TB";
    case "vertical":
      return "TB";
    case "radial":
    default:
      return "TB";
  }
}
