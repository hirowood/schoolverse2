import type { Edge, Node, Viewport } from "reactflow";

export interface MindMapNodeData {
  label: string;
  description?: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  fontSize: number;
  shape: "rounded" | "rectangle" | "ellipse" | "diamond";
  level: number;
  isCollapsed: boolean;
  linkedNoteId?: string;
}

export type MindMapNode = Node<MindMapNodeData, "mindMapNode" | "rootNode" | "groupNode">;

export interface MindMapEdgeData {
  strokeColor: string;
  strokeWidth: number;
  animated: boolean;
  label?: string;
}

export type MindMapEdge = Edge<MindMapEdgeData>;

export interface HistoryEntry {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  timestamp: number;
}

export type MindMapTheme = "default" | "dark" | "colorful" | "minimal";
export type LayoutType = "radial" | "tree" | "horizontal" | "vertical";

export interface MindMapState {
  id: string | null;
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  viewport: Viewport;
  theme: MindMapTheme;
  layoutType: LayoutType;
  selectedNodeId: string | null;
  isEditing: boolean;
  isDirty: boolean;
  history: {
    past: HistoryEntry[];
    future: HistoryEntry[];
  };
}

export const THEME_PRESETS: Record<
  MindMapTheme,
  {
    root: Partial<MindMapNodeData>;
    node: Partial<MindMapNodeData>;
    edge: Partial<MindMapEdgeData>;
    background: string;
  }
> = {
  default: {
    root: { backgroundColor: "#3b82f6", textColor: "#ffffff", borderColor: "#2563eb" },
    node: { backgroundColor: "#ffffff", textColor: "#1e293b", borderColor: "#e2e8f0" },
    edge: { strokeColor: "#94a3b8", strokeWidth: 2 },
    background: "#f8fafc",
  },
  dark: {
    root: { backgroundColor: "#6366f1", textColor: "#ffffff", borderColor: "#4f46e5" },
    node: { backgroundColor: "#1e293b", textColor: "#f1f5f9", borderColor: "#334155" },
    edge: { strokeColor: "#475569", strokeWidth: 2 },
    background: "#0f172a",
  },
  colorful: {
    root: { backgroundColor: "#f43f5e", textColor: "#ffffff", borderColor: "#e11d48" },
    node: { backgroundColor: "#fef3c7", textColor: "#92400e", borderColor: "#fbbf24" },
    edge: { strokeColor: "#fb923c", strokeWidth: 2 },
    background: "#fffbeb",
  },
  minimal: {
    root: { backgroundColor: "#18181b", textColor: "#ffffff", borderColor: "#27272a" },
    node: { backgroundColor: "#ffffff", textColor: "#18181b", borderColor: "#d4d4d8" },
    edge: { strokeColor: "#a1a1aa", strokeWidth: 1 },
    background: "#ffffff",
  },
};

export const LAYOUT_CONFIG: Record<
  LayoutType,
  {
    direction: "TB" | "BT" | "LR" | "RL" | "radial";
    nodeSpacing: number;
    levelSpacing: number;
  }
> = {
  radial: { direction: "radial", nodeSpacing: 100, levelSpacing: 150 },
  tree: { direction: "TB", nodeSpacing: 80, levelSpacing: 120 },
  horizontal: { direction: "LR", nodeSpacing: 60, levelSpacing: 200 },
  vertical: { direction: "TB", nodeSpacing: 100, levelSpacing: 100 },
};
