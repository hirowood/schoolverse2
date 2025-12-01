"use client";

import { useEffect, useMemo, useState } from "react";
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

type Props = {
  initialState?: Partial<MindMapState>;
};

const fitViewOptions: FitViewOptions = { padding: 0.2 };

export default function MindMapCanvas({ initialState }: Props) {
  const {
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
  } = useMindMapStore();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  useEffect(() => {
    if (initialState) {
      initialize(initialState);
    }
  }, [initialState, initialize]);

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
        onUndo={undo}
        onRedo={redo}
        onLayout={autoLayout}
        onDelete={() => selectedNodeId && deleteNode(selectedNodeId)}
        onFitView={() => rfInstance?.fitView(fitViewOptions)}
        isDirty={isDirty}
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
    </div>
  );
}
