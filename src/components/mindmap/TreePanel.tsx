"use client";

import { useMemo, useCallback } from "react";
import type { MindMapNode, MindMapEdge } from "@/lib/mindmap/types";

interface TreeNode {
  id: string;
  label: string;
  level: number;
  isCollapsed: boolean;
  children: TreeNode[];
  hasChildren: boolean;
}

interface Props {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

export default function TreePanel({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onToggleCollapse,
  onAddChild,
}: Props) {
  // エッジからノードの親子関係を構築
  const buildTree = useCallback((): TreeNode[] => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const childrenMap = new Map<string, string[]>();
    const hasParent = new Set<string>();

    // 親子関係を構築
    edges.forEach((edge) => {
      const children = childrenMap.get(edge.source) || [];
      children.push(edge.target);
      childrenMap.set(edge.source, children);
      hasParent.add(edge.target);
    });

    // ルートノード（親を持たないノード）を特定
    const rootIds = nodes.filter((n) => !hasParent.has(n.id)).map((n) => n.id);

    // 再帰的にツリーノードを構築
    const buildTreeNode = (nodeId: string, visited = new Set<string>()): TreeNode | null => {
      if (visited.has(nodeId)) return null; // 循環参照防止
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) return null;

      const childIds = childrenMap.get(nodeId) || [];
      const children = childIds
        .map((cid) => buildTreeNode(cid, new Set(visited)))
        .filter((c): c is TreeNode => c !== null);

      return {
        id: node.id,
        label: node.data.label,
        level: node.data.level,
        isCollapsed: node.data.isCollapsed,
        children,
        hasChildren: children.length > 0,
      };
    };

    return rootIds
      .map((id) => buildTreeNode(id))
      .filter((t): t is TreeNode => t !== null);
  }, [nodes, edges]);

  const treeData = useMemo(() => buildTree(), [buildTree]);

  // ツリーノードをレンダリング
  const renderTreeNode = (treeNode: TreeNode, depth = 0) => {
    const isSelected = selectedNodeId === treeNode.id;
    const hasChildren = treeNode.hasChildren;

    return (
      <div key={treeNode.id} className="select-none">
        <div
          className={`
            flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer
            transition-colors duration-150
            ${isSelected
              ? "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100"
              : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
            }
          `}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => onSelectNode(treeNode.id)}
        >
          {/* 折りたたみボタン */}
          {hasChildren ? (
            <button
              className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(treeNode.id);
              }}
            >
              {treeNode.isCollapsed ? "▶" : "▼"}
            </button>
          ) : (
            <span className="w-5 h-5 flex items-center justify-center text-slate-300 dark:text-slate-600">
              •
            </span>
          )}

          {/* レベルインジケーター */}
          <span
            className={`
              w-2 h-2 rounded-full flex-shrink-0
              ${treeNode.level === 0
                ? "bg-blue-500"
                : treeNode.level === 1
                ? "bg-green-500"
                : treeNode.level === 2
                ? "bg-yellow-500"
                : "bg-slate-400"
              }
            `}
          />

          {/* ノード名 */}
          <span className="flex-1 truncate text-sm font-medium">
            {treeNode.label}
          </span>

          {/* 子ノード追加ボタン */}
          <button
            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-blue-500 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(treeNode.id);
            }}
            title="子ノードを追加"
          >
            +
          </button>
        </div>

        {/* 子ノード */}
        {hasChildren && !treeNode.isCollapsed && (
          <div className="border-l border-slate-200 dark:border-slate-700 ml-4">
            {treeNode.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          🌳 ツリー構造
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {nodes.length} ノード
        </span>
      </div>

      {/* ツリー本体 */}
      <div className="flex-1 overflow-y-auto p-2">
        {treeData.length > 0 ? (
          <div className="space-y-1 group">
            {treeData.map((root) => renderTreeNode(root))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
            <div className="mb-2">🌱</div>
            ノードがありません<br />
            「ルート」ボタンで追加してください
          </div>
        )}
      </div>

      {/* フッター：統計情報 */}
      <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex justify-between">
          <span>接続: {edges.length}</span>
          <span>深さ: {Math.max(...nodes.map((n) => n.data.level), 0) + 1}階層</span>
        </div>
      </div>
    </div>
  );
}
