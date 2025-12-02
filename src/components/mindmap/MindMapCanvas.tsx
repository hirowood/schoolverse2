"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  type Connection,
  type FitViewOptions,
  type NodeTypes,
  type ReactFlowInstance,
  ConnectionLineType,
} from "reactflow";
import "reactflow/dist/style.css";

import { useMindMapStore } from "@/lib/mindmap/store";
import type { MindMapEdge, MindMapNode, MindMapState, WBSData } from "@/lib/mindmap/types";
import { DEFAULT_WBS_DATA } from "@/lib/mindmap/types";
import MindMapNodeCard from "./MindMapNode";
import MindMapToolbar from "./MindMapToolbar";
import NodeEditor from "./NodeEditor";
import TreePanel from "./TreePanel";
import WBSPanel from "./WBSPanel";
import TimelinePanel from "./TimelinePanel";
import MindMapAIPanel from "./MindMapAIPanel";

type Props = {
  initialState?: Partial<MindMapState>;
};

const fitViewOptions: FitViewOptions = { padding: 0.2 };

const defaultEdgeOptions = {
  type: "smoothstep",
  style: { strokeWidth: 2, stroke: "#94a3b8" },
  animated: false,
};

export default function MindMapCanvas({ initialState }: Props) {
  const {
    id,
    nodes,
    edges,
    selectedNodeId,
    isDirty,
    layoutType,
    viewMode,
    initialize,
    addNode,
    deleteNode,
    onNodesChange,
    onEdgesChange,
    addEdge,
    selectNode,
    undo,
    redo,
    autoLayout,
    setViewport,
    setLayoutType,
    setViewMode,
    markClean,
    updateNode,
    updateWBS,
    viewport,
    toggleCollapse,
    expandAll,
    collapseAll,
  } = useMindMapStore();

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialNodesRef = useRef<Map<string, MindMapNode>>(new Map());
  const initialEdgesRef = useRef<Map<string, MindMapEdge>>(new Map());
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [treePanelOpen, setTreePanelOpen] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  useEffect(() => {
    if (initialState) {
      initialize(initialState);
      if (initialState.nodes) {
        initialNodesRef.current = new Map(initialState.nodes.map((n) => [n.id, n]));
      }
      if (initialState.edges) {
        initialEdgesRef.current = new Map(initialState.edges.map((e) => [e.id, e]));
      }
    }
  }, [initialState, initialize]);

  // 選択中のノードを取得
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [nodes, selectedNodeId]);

  // 折りたたまれたノードの子孫を非表示にする
  const { visibleNodes, visibleEdges } = useMemo(() => {
    const collapsedNodeIds = new Set(
      nodes.filter((n) => n.data.isCollapsed).map((n) => n.id)
    );

    const hiddenNodeIds = new Set<string>();

    const collectHiddenNodes = (parentId: string) => {
      edges
        .filter((e) => e.source === parentId)
        .forEach((e) => {
          hiddenNodeIds.add(e.target);
          collectHiddenNodes(e.target);
        });
    };

    collapsedNodeIds.forEach((nodeId) => {
      collectHiddenNodes(nodeId);
    });

    const visibleNodes = nodes.filter((n) => !hiddenNodeIds.has(n.id));
    const visibleEdges = edges.filter(
      (e) => !hiddenNodeIds.has(e.source) && !hiddenNodeIds.has(e.target)
    );

    return { visibleNodes, visibleEdges };
  }, [nodes, edges]);

  const saveChanges = useCallback(async () => {
    if (!id || (!isDirty && !saving)) return;
    setSaving(true);
    setError(null);

    const currentNodeIds = new Set(nodes.map((n) => n.id));
    const currentEdgeIds = new Set(edges.map((e) => e.id));
    const initialNodeIds = new Set(initialNodesRef.current.keys());
    const initialEdgeIds = new Set(initialEdgesRef.current.keys());

    const deletedNodeIds = [...initialNodeIds].filter((nid) => !currentNodeIds.has(nid));
    const deletedEdgeIds = [...initialEdgeIds].filter((eid) => !currentEdgeIds.has(eid));

    const newNodes = nodes.filter((n) => !initialNodeIds.has(n.id));
    const updatedNodes = nodes
      .filter((n) => initialNodeIds.has(n.id))
      .map((n) => ({
        id: n.id,
        data: {
          label: n.data.label,
          description: n.data.description,
          backgroundColor: n.data.backgroundColor,
          borderColor: n.data.borderColor,
          textColor: n.data.textColor,
          fontSize: n.data.fontSize,
          shape: n.data.shape,
          isCollapsed: n.data.isCollapsed,
          positionX: n.position.x,
          positionY: n.position.y,
          sortOrder: 0,
          wbs: n.data.wbs,
        },
      }));

    const newEdges = edges.filter((e) => !initialEdgeIds.has(e.id));

    try {
      const res = await fetch(`/api/mindmap/${id}/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodes: {
            create: newNodes.map((n) => ({
              id: n.id,
              label: n.data.label,
              description: n.data.description,
              positionX: n.position.x,
              positionY: n.position.y,
              backgroundColor: n.data.backgroundColor,
              borderColor: n.data.borderColor,
              textColor: n.data.textColor,
              fontSize: n.data.fontSize,
              shape: n.data.shape,
              sortOrder: 0,
              wbs: n.data.wbs,
            })),
            update: updatedNodes,
            delete: deletedNodeIds,
          },
          edges: {
            create: newEdges.map((e) => ({
              id: e.id,
              sourceId: e.source,
              targetId: e.target,
              type: e.type,
              strokeColor: e.data?.strokeColor,
              strokeWidth: e.data?.strokeWidth,
              animated: e.data?.animated,
              label: e.data?.label,
            })),
            delete: deletedEdgeIds,
          },
          viewport: {
            x: viewport.x,
            y: viewport.y,
            zoom: viewport.zoom,
          },
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error ?? "保存に失敗しました");
      }
      initialNodesRef.current = new Map(nodes.map((n) => [n.id, n]));
      initialEdgesRef.current = new Map(edges.map((e) => [e.id, e]));
      markClean();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }, [edges, id, isDirty, markClean, nodes, saving, viewport]);

  useEffect(() => {
    if (!id) return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      void saveChanges();
    }, 2000);
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [edges, nodes, viewport, id, saveChanges]);

  const nodeTypes = useMemo<NodeTypes>(() => {
    return {
      mindMapNode: MindMapNodeCard,
      rootNode: MindMapNodeCard,
      groupNode: MindMapNodeCard,
    };
  }, []);

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return;
      const exists = edges.some(
        (e) => e.source === connection.source && e.target === connection.target
      );
      if (!exists) {
        addEdge(connection);
      }
    },
    [addEdge, edges]
  );

  const isValidConnection = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return false;
      const exists = edges.some(
        (e) => e.source === connection.source && e.target === connection.target
      );
      return !exists;
    },
    [edges]
  );

  const handleAddChildFromTree = useCallback(
    (parentId: string) => {
      addNode(parentId, "新しいノード");
    },
    [addNode]
  );

  // ノード選択時にビューを中央に移動
  const handleSelectNodeWithCenter = useCallback(
    (nodeId: string) => {
      selectNode(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (node && rfInstance && viewMode === "mindmap") {
        rfInstance.setCenter(node.position.x + 70, node.position.y + 25, {
          zoom: 1,
          duration: 500,
        });
      }
    },
    [nodes, rfInstance, selectNode, viewMode]
  );

  // AIからの提案でノードを追加
  const handleAddNodesFromAI = useCallback(
    (
      parentId: string,
      newNodes: Array<{
        label: string;
        description?: string;
        estimatedHours?: number;
        priority?: string;
      }>
    ) => {
      const parentNode = nodes.find((n) => n.id === parentId);
      if (!parentNode) return;

      newNodes.forEach((node, index) => {
        const nodeId = addNode(parentId, node.label);
        
        // WBSデータを設定
        if (node.estimatedHours || node.priority) {
          updateWBS(nodeId, {
            ...DEFAULT_WBS_DATA,
            estimatedHours: node.estimatedHours,
            priority: (node.priority as WBSData["priority"]) || "medium",
          });
        }

        // 説明を設定
        if (node.description) {
          updateNode(nodeId, { description: node.description });
        }
      });

      // レイアウトを自動調整
      setTimeout(() => {
        autoLayout();
      }, 100);
    },
    [nodes, addNode, updateWBS, updateNode, autoLayout]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-2">
      <MindMapToolbar
        onAddRoot={() => addNode(null, "新しいノード")}
        onAddChild={() => addNode(selectedNodeId, "子ノード")}
        onEdit={() => setEditorOpen(true)}
        onUndo={undo}
        onRedo={redo}
        onLayout={autoLayout}
        onDelete={() => selectedNodeId && deleteNode(selectedNodeId)}
        onFitView={() => rfInstance?.fitView(fitViewOptions)}
        isDirty={isDirty || saving}
        selectedNodeId={selectedNodeId}
        layoutType={layoutType}
        onLayoutTypeChange={setLayoutType}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        onToggleTreePanel={() => setTreePanelOpen(!treePanelOpen)}
        isTreePanelOpen={treePanelOpen}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onToggleAIPanel={() => setAiPanelOpen(!aiPanelOpen)}
        isAIPanelOpen={aiPanelOpen}
      />

      <div className="flex-1 flex rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
        {/* メインコンテンツ */}
        <div className="flex-1 flex">
          {/* マインドマップモード */}
          {viewMode === "mindmap" && (
            <div className="flex h-full w-full">
              {/* ツリーパネル */}
              {treePanelOpen && (
                <div className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-700">
                  <TreePanel
                    nodes={nodes}
                    edges={edges}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={handleSelectNodeWithCenter}
                    onToggleCollapse={toggleCollapse}
                    onAddChild={handleAddChildFromTree}
                  />
                </div>
              )}

              {/* ReactFlow キャンバス */}
              <div className="flex-1">
                <ReactFlow
                  nodes={visibleNodes}
                  edges={visibleEdges}
                  nodeTypes={nodeTypes}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={handleConnect}
                  isValidConnection={isValidConnection}
                  onNodeClick={(_, node) => selectNode(node.id)}
                  onPaneClick={() => selectNode(null)}
                  fitView
                  fitViewOptions={fitViewOptions}
                  onMoveEnd={(_, viewport) => setViewport(viewport)}
                  onInit={(instance) => setRfInstance(instance)}
                  connectionMode={ConnectionMode.Loose}
                  connectionLineType={ConnectionLineType.SmoothStep}
                  connectionLineStyle={{ strokeWidth: 2, stroke: "#3b82f6" }}
                  defaultEdgeOptions={defaultEdgeOptions}
                  connectOnClick={false}
                  edgesUpdatable
                  edgesFocusable
                  deleteKeyCode={["Backspace", "Delete"]}
                >
                  <MiniMap
                    nodeStrokeWidth={3}
                    zoomable
                    pannable
                    className="!bg-slate-100 dark:!bg-slate-800"
                  />
                  <Controls showFitView={false} />
                  <Background gap={16} />
                </ReactFlow>
              </div>
            </div>
          )}

          {/* WBSテーブルモード */}
          {viewMode === "wbs" && (
            <WBSPanel
              nodes={nodes}
              edges={edges}
              selectedNodeId={selectedNodeId}
              onSelectNode={selectNode}
              onUpdateWBS={updateWBS}
            />
          )}

          {/* タイムラインモード */}
          {viewMode === "timeline" && (
            <TimelinePanel
              nodes={nodes}
              edges={edges}
              selectedNodeId={selectedNodeId}
              onSelectNode={selectNode}
            />
          )}
        </div>

        {/* AIパネル（右サイドバー） */}
        {aiPanelOpen && (
          <div className="w-80 flex-shrink-0 border-l border-slate-200 dark:border-slate-700">
            <MindMapAIPanel
              mindMapId={id}
              selectedNodeId={selectedNodeId}
              selectedNode={selectedNode}
              onAddNodes={handleAddNodesFromAI}
              onClose={() => setAiPanelOpen(false)}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      <NodeEditor
        open={editorOpen && !!selectedNodeId}
        nodeId={selectedNodeId}
        data={nodes.find((n) => n.id === selectedNodeId)?.data ?? null}
        onClose={() => setEditorOpen(false)}
        onSave={(data) => {
          if (!selectedNodeId) return;
          updateNode(selectedNodeId, data);
          setEditorOpen(false);
        }}
      />
    </div>
  );
}
