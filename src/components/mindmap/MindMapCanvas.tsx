"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Connection,
  type FitViewOptions,
  type NodeTypes,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import { useMindMapStore } from "@/lib/mindmap/store";
import type { MindMapEdge, MindMapNode, MindMapState } from "@/lib/mindmap/types";
import MindMapNodeCard from "./MindMapNode";
import MindMapToolbar from "./MindMapToolbar";
import NodeEditor from "./NodeEditor";

type Props = {
  initialState?: Partial<MindMapState>;
};

const fitViewOptions: FitViewOptions = { padding: 0.2 };

export default function MindMapCanvas({ initialState }: Props) {
  const {
    id,
    nodes,
    edges,
    selectedNodeId,
    isDirty,
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
    markClean,
    viewport,
  } = useMindMapStore();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialNodesRef = useRef<Map<string, MindMapNode>>(new Map());
  const initialEdgesRef = useRef<Map<string, MindMapEdge>>(new Map());
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

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
      // 成功したら初期状態を更新
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

  const handleConnect = (connection: Connection) => {
    addEdge(connection);
  };

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
      />

      <div className="flex-1 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onNodeClick={(_, node) => selectNode(node.id)}
          onPaneClick={() => selectNode(null)}
          fitView
          fitViewOptions={fitViewOptions}
          onMoveEnd={(_, viewport) => setViewport(viewport)}
          onInit={(instance) => setRfInstance(instance)}
        >
          <MiniMap />
          <Controls showFitView={false} />
          <Background gap={16} />
        </ReactFlow>
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
