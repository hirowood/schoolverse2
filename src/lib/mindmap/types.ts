import type { Edge, Node, Viewport } from "reactflow";

// WBS関連の型定義
export type TaskStatus = "not_started" | "in_progress" | "completed" | "on_hold" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface WBSData {
  // 基本情報
  assignee?: string;           // 担当者
  startDate?: string;          // 開始日 (YYYY-MM-DD)
  endDate?: string;            // 終了日 (YYYY-MM-DD)
  dueDate?: string;            // 期限 (YYYY-MM-DD)
  
  // 進捗管理
  status: TaskStatus;          // ステータス
  progress: number;            // 進捗率 (0-100)
  
  // 工数管理
  estimatedHours?: number;     // 見積もり工数（時間）
  actualHours?: number;        // 実績工数（時間）
  
  // 優先度・その他
  priority: TaskPriority;      // 優先度
  wbsCode?: string;            // WBSコード (例: 1.2.3)
  notes?: string;              // 備考
  tags?: string[];             // タグ
}

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
  childCount?: number;
  
  // WBS拡張
  wbs?: WBSData;
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
export type ViewMode = "mindmap" | "wbs" | "timeline";

export interface MindMapState {
  id: string | null;
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  viewport: Viewport;
  theme: MindMapTheme;
  layoutType: LayoutType;
  viewMode: ViewMode;
  selectedNodeId: string | null;
  isEditing: boolean;
  isDirty: boolean;
  history: {
    past: HistoryEntry[];
    future: HistoryEntry[];
  };
}

// ステータスの表示設定
export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  not_started: { label: "未着手", color: "#64748b", bgColor: "#f1f5f9" },
  in_progress: { label: "進行中", color: "#3b82f6", bgColor: "#dbeafe" },
  completed: { label: "完了", color: "#22c55e", bgColor: "#dcfce7" },
  on_hold: { label: "保留", color: "#f59e0b", bgColor: "#fef3c7" },
  cancelled: { label: "中止", color: "#ef4444", bgColor: "#fee2e2" },
};

// 優先度の表示設定
export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; icon: string }> = {
  low: { label: "低", color: "#94a3b8", icon: "▽" },
  medium: { label: "中", color: "#3b82f6", icon: "◇" },
  high: { label: "高", color: "#f59e0b", icon: "△" },
  critical: { label: "最優先", color: "#ef4444", icon: "▲" },
};

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

// デフォルトWBSデータ
export const DEFAULT_WBS_DATA: WBSData = {
  status: "not_started",
  progress: 0,
  priority: "medium",
};
