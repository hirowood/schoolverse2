import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "reactflow";
import type {
  HistoryEntry,
  LayoutType,
  MindMapEdge,
  MindMapNode,
  MindMapState,
  MindMapTheme,
  ViewMode,
  WBSData,
} from "./types";
import { layoutMindMap } from "./layout";
import { DEFAULT_WBS_DATA } from "./types";

interface MindMapActions {
  initialize: (data: Partial<MindMapState>) => void;
  reset: () => void;
  addNode: (parentId: string | null, label?: string) => string;
  updateNode: (id: string, data: Partial<MindMapNode["data"]>) => void;
  deleteNode: (id: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  addEdge: (connection: Connection) => void;
  deleteEdge: (id: string) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  selectNode: (id: string | null) => void;
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  setTheme: (theme: MindMapTheme) => void;
  setLayoutType: (layout: LayoutType) => void;
  setViewMode: (mode: ViewMode) => void;
  setTitle: (title: string) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  setEditing: (isEditing: boolean) => void;
  markDirty: () => void;
  markClean: () => void;
  toggleCollapse: (nodeId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  autoLayout: () => void;
  // WBS機能
  updateWBS: (nodeId: string, wbs: Partial<WBSData>) => void;
  calculateProgress: (nodeId: string) => number;
  // ヘルパー
  getChildCount: (nodeId: string) => number;
  getDescendantIds: (nodeId: string) => string[];
}

const initialState: MindMapState = {
  id: null,
  title: "無題のマインドマップ",
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  theme: "default",
  layoutType: "tree",
  viewMode: "mindmap",
  selectedNodeId: null,
  isEditing: false,
  isDirty: false,
  history: { past: [], future: [] },
};

const MAX_HISTORY = 50;

export const useMindMapStore = create<MindMapState & MindMapActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      initialize: (data) => {
        const edges = data.edges || [];
        // ノードに子ノード数とデフォルトWBSを追加
        const nodesWithData = (data.nodes || []).map((node) => {
          const childCount = edges.filter((e) => e.source === node.id).length;
          return {
            ...node,
            data: {
              ...node.data,
              childCount,
              wbs: node.data.wbs || { ...DEFAULT_WBS_DATA },
            },
          };
        });

        set({
          ...initialState,
          ...data,
          nodes: nodesWithData,
          history: { past: [], future: [] },
        });
      },

      reset: () => set(initialState),

      addNode: (parentId, label = "新しいノード") => {
        const state = get();
        const id = `node-${Date.now()}`;

        const parent = parentId ? state.nodes.find((n) => n.id === parentId) : null;
        const siblingCount = state.nodes.filter((n) =>
          state.edges.some((e) => e.source === parentId && e.target === n.id)
        ).length;

        const level = parent ? parent.data.level + 1 : 0;
        const angle = (siblingCount * 45 * Math.PI) / 180;
        const distance = 150 + level * 30;
        const position = parent
          ? {
              x: parent.position.x + Math.cos(angle) * distance,
              y: parent.position.y + Math.sin(angle) * distance,
            }
          : { x: 0, y: 0 };

        const newNode: MindMapNode = {
          id,
          type: level === 0 ? "rootNode" : "mindMapNode",
          position,
          data: {
            label,
            backgroundColor: level === 0 ? "#3b82f6" : "#ffffff",
            borderColor: level === 0 ? "#2563eb" : "#e2e8f0",
            textColor: level === 0 ? "#ffffff" : "#1e293b",
            fontSize: level === 0 ? 18 : 14,
            shape: "rounded",
            level,
            isCollapsed: false,
            childCount: 0,
            wbs: { ...DEFAULT_WBS_DATA },
          },
        };

        get().pushHistory();
        set((state) => {
          const updatedNodes = parentId
            ? state.nodes.map((n) =>
                n.id === parentId
                  ? { ...n, data: { ...n.data, childCount: (n.data.childCount || 0) + 1 } }
                  : n
              )
            : state.nodes;

          return {
            nodes: [...updatedNodes, newNode],
            edges: parentId
              ? [
                  ...state.edges,
                  {
                    id: `edge-${parentId}-${id}`,
                    source: parentId,
                    target: id,
                    type: "smoothstep",
                    data: { strokeColor: "#94a3b8", strokeWidth: 2, animated: false },
                  },
                ]
              : state.edges,
            isDirty: true,
          };
        });
        return id;
      },

      updateNode: (id, data) => {
        get().pushHistory();
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, ...data } } : node
          ),
          isDirty: true,
        }));
      },

      deleteNode: (id) => {
        const state = get();
        const getDescendantIds = (nodeId: string): string[] => {
          const childIds = state.edges.filter((e) => e.source === nodeId).map((e) => e.target);
          return [nodeId, ...childIds.flatMap(getDescendantIds)];
        };
        const idsToDelete = new Set(getDescendantIds(id));

        const parentEdge = state.edges.find((e) => e.target === id);
        const parentId = parentEdge?.source;

        get().pushHistory();
        set((state) => ({
          nodes: state.nodes
            .filter((n) => !idsToDelete.has(n.id))
            .map((n) =>
              n.id === parentId
                ? { ...n, data: { ...n.data, childCount: Math.max(0, (n.data.childCount || 0) - 1) } }
                : n
            ),
          edges: state.edges.filter((e) => !idsToDelete.has(e.source) && !idsToDelete.has(e.target)),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
          isDirty: true,
        }));
      },

      onNodesChange: (changes) => {
        set((state) => ({
          nodes: applyNodeChanges(changes, state.nodes) as MindMapNode[],
          isDirty: true,
        }));
      },

      onEdgesChange: (changes) => {
        set((state) => ({
          edges: applyEdgeChanges(changes, state.edges) as MindMapEdge[],
          isDirty: true,
        }));
      },

      addEdge: (connection) => {
        if (!connection.source || !connection.target) return;
        get().pushHistory();
        set((state) => {
          const updatedNodes = state.nodes.map((n) =>
            n.id === connection.source
              ? { ...n, data: { ...n.data, childCount: (n.data.childCount || 0) + 1 } }
              : n
          );

          return {
            nodes: updatedNodes,
            edges: [
              ...state.edges,
              {
                id: `edge-${connection.source}-${connection.target}`,
                source: connection.source,
                target: connection.target,
                type: "smoothstep",
                data: { strokeColor: "#94a3b8", strokeWidth: 2, animated: false },
              },
            ],
            isDirty: true,
          };
        });
      },

      deleteEdge: (id) => {
        const state = get();
        const edge = state.edges.find((e) => e.id === id);

        get().pushHistory();
        set((state) => {
          const updatedNodes = edge
            ? state.nodes.map((n) =>
                n.id === edge.source
                  ? { ...n, data: { ...n.data, childCount: Math.max(0, (n.data.childCount || 0) - 1) } }
                  : n
              )
            : state.nodes;

          return {
            nodes: updatedNodes,
            edges: state.edges.filter((e) => e.id !== id),
            isDirty: true,
          };
        });
      },

      selectNode: (id) => set({ selectedNodeId: id }),

      setViewport: (viewport) => set({ viewport, isDirty: true }),

      setTheme: (theme) => set({ theme, isDirty: true }),

      setLayoutType: (layoutType) => {
        set({ layoutType, isDirty: true });
        get().autoLayout();
      },

      setViewMode: (viewMode) => set({ viewMode }),

      setTitle: (title) => set({ title, isDirty: true }),

      undo: () => {
        const { history, nodes, edges } = get();
        if (history.past.length === 0) return;
        const previous = history.past[history.past.length - 1];
        set({
          nodes: previous.nodes,
          edges: previous.edges,
          history: {
            past: history.past.slice(0, -1),
            future: [{ nodes, edges, timestamp: Date.now() }, ...history.future],
          },
        });
      },

      redo: () => {
        const { history, nodes, edges } = get();
        if (history.future.length === 0) return;
        const next = history.future[0];
        set({
          nodes: next.nodes,
          edges: next.edges,
          history: {
            past: [...history.past, { nodes, edges, timestamp: Date.now() }],
            future: history.future.slice(1),
          },
        });
      },

      pushHistory: () => {
        const { nodes, edges, history } = get();
        const nextPast: HistoryEntry[] = [
          ...history.past.slice(-MAX_HISTORY + 1),
          { nodes, edges, timestamp: Date.now() },
        ];
        set({ history: { past: nextPast, future: [] } });
      },

      setEditing: (isEditing) => set({ isEditing }),

      markDirty: () => set({ isDirty: true }),

      markClean: () => set({ isDirty: false }),

      toggleCollapse: (nodeId) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, isCollapsed: !node.data.isCollapsed } }
              : node
          ),
          isDirty: true,
        }));
      },

      expandAll: () => {
        get().pushHistory();
        set((state) => ({
          nodes: state.nodes.map((node) => ({
            ...node,
            data: { ...node.data, isCollapsed: false },
          })),
          isDirty: true,
        }));
      },

      collapseAll: () => {
        const state = get();
        const nodesWithChildren = new Set(state.edges.map((e) => e.source));

        get().pushHistory();
        set((state) => ({
          nodes: state.nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              isCollapsed: nodesWithChildren.has(node.id) ? true : node.data.isCollapsed,
            },
          })),
          isDirty: true,
        }));
      },

      autoLayout: () => {
        const state = get();
        const laidOut = layoutMindMap(state.nodes, state.edges, { layoutType: state.layoutType });
        get().pushHistory();
        set({
          nodes: laidOut.nodes,
          edges: laidOut.edges,
          isDirty: true,
        });
      },

      // WBS機能
      updateWBS: (nodeId, wbs) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    wbs: { ...(node.data.wbs || DEFAULT_WBS_DATA), ...wbs },
                  },
                }
              : node
          ),
          isDirty: true,
        }));
      },

      calculateProgress: (nodeId) => {
        const state = get();
        const childIds = state.edges.filter((e) => e.source === nodeId).map((e) => e.target);

        if (childIds.length === 0) {
          const node = state.nodes.find((n) => n.id === nodeId);
          return node?.data.wbs?.progress || 0;
        }

        const childProgresses = childIds.map((cid) => get().calculateProgress(cid));
        return Math.round(childProgresses.reduce((sum, p) => sum + p, 0) / childProgresses.length);
      },

      // ヘルパー
      getChildCount: (nodeId) => {
        const state = get();
        return state.edges.filter((e) => e.source === nodeId).length;
      },

      getDescendantIds: (nodeId) => {
        const state = get();
        const getDescendants = (id: string): string[] => {
          const childIds = state.edges.filter((e) => e.source === id).map((e) => e.target);
          return [id, ...childIds.flatMap(getDescendants)];
        };
        return getDescendants(nodeId).slice(1);
      },
    }),
    { name: "mindmap-store" }
  )
);
