"use client";

import { useState, useRef, useEffect } from "react";
import { useMindMapAI, type AIMessage, type BreakdownSuggestion, type ActionSuggestion } from "@/hooks/useMindMapAI";
import type { AIAction } from "@/lib/coach/prompts/mindmapSystem";
import type { MindMapNode } from "@/lib/mindmap/types";

interface Props {
  mindMapId: string | null;
  selectedNodeId: string | null;
  selectedNode: MindMapNode | null;
  onAddNodes: (
    parentId: string,
    nodes: Array<{ label: string; description?: string; estimatedHours?: number; priority?: string }>
  ) => void;
  onClose: () => void;
}

const ACTION_BUTTONS: Array<{ action: AIAction; label: string; icon: string; description: string }> = [
  { action: "analyze", label: "全体分析", icon: "🔍", description: "マインドマップ全体を分析" },
  { action: "suggest_breakdown", label: "タスク分解", icon: "🧩", description: "選択中のタスクを分解" },
  { action: "next_action", label: "次の一歩", icon: "👣", description: "今すぐやるべきことを提案" },
  { action: "progress_feedback", label: "進捗FB", icon: "📈", description: "進捗についてフィードバック" },
  { action: "suggest_wbs", label: "WBS最適化", icon: "⚙️", description: "期限・工数・優先度を提案" },
];

export default function MindMapAIPanel({
  mindMapId,
  selectedNodeId,
  selectedNode,
  onAddNodes,
  onClose,
}: Props) {
  const { messages, isLoading, error, sendMessage, clearError } = useMindMapAI(mindMapId);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージが追加されたらスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAction = (action: AIAction) => {
    sendMessage(action, undefined, selectedNodeId ?? undefined);
  };

  const handleSendChat = () => {
    if (!inputText.trim()) return;
    sendMessage("chat", inputText.trim());
    setInputText("");
  };

  const handleApplySuggestions = (message: AIMessage) => {
    if (!message.suggestions) return;

    if (message.suggestions.type === "breakdown" && selectedNodeId) {
      const data = message.suggestions.data as BreakdownSuggestion;
      onAddNodes(selectedNodeId, data.suggestions);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="flex items-center gap-2 text-white">
          <span className="text-xl">🤖</span>
          <h3 className="font-semibold">AIコーチ</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-xl"
        >
          ×
        </button>
      </div>

      {/* 選択中のノード */}
      {selectedNode && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border-b border-slate-200 dark:border-slate-700">
          <div className="text-xs text-blue-600 dark:text-blue-400">選択中:</div>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
            {selectedNode.data.label}
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex flex-wrap gap-1">
          {ACTION_BUTTONS.map((btn) => (
            <button
              key={btn.action}
              onClick={() => handleAction(btn.action)}
              disabled={isLoading || (btn.action === "suggest_breakdown" && !selectedNodeId)}
              className={`
                px-2 py-1.5 text-xs rounded-lg flex items-center gap-1 transition-all
                ${btn.action === "suggest_breakdown" && !selectedNodeId
                  ? "opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-700"
                  : "bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-200 dark:border-slate-600 hover:border-blue-400"
                }
              `}
              title={btn.description}
            >
              <span>{btn.icon}</span>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🤖</div>
            <div className="text-slate-500 dark:text-slate-400 text-sm">
              AIコーチがあなたのプロジェクトをサポートします！
            </div>
            <div className="text-slate-400 dark:text-slate-500 text-xs mt-2">
              上のボタンから機能を選ぶか、<br />
              下のチャットで自由に相談してください
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onApply={() => handleApplySuggestions(msg)}
            canApply={
              msg.role === "assistant" &&
              msg.suggestions?.type === "breakdown" &&
              !!selectedNodeId
            }
          />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-sm">考え中...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
            <button
              onClick={clearError}
              className="text-xs text-red-500 hover:underline mt-1"
            >
              閉じる
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* チャット入力 */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendChat();
              }
            }}
            placeholder="AIコーチに相談..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendChat}
            disabled={isLoading || !inputText.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}

// メッセージバブルコンポーネント
function MessageBubble({
  message,
  onApply,
  canApply,
}: {
  message: AIMessage;
  onApply: () => void;
  canApply: boolean;
}) {
  const isUser = message.role === "user";

  // JSONを除去してテキスト部分だけ抽出
  const displayText = message.content.replace(/```json[\s\S]*?```/g, "").trim();

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[85%] rounded-2xl px-4 py-2.5
          ${isUser
            ? "bg-blue-500 text-white rounded-br-md"
            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md"
          }
        `}
      >
        {/* メッセージ本文 */}
        <div className="text-sm whitespace-pre-wrap">{displayText}</div>

        {/* 提案カード */}
        {message.suggestions && (
          <div className="mt-3 pt-3 border-t border-slate-200/30 dark:border-slate-600/30">
            <SuggestionCard
              suggestions={message.suggestions}
              onApply={onApply}
              canApply={canApply}
            />
          </div>
        )}

        {/* タイムスタンプ */}
        <div
          className={`text-[10px] mt-1 ${isUser ? "text-blue-200" : "text-slate-400 dark:text-slate-500"}`}
        >
          {message.createdAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

// 提案カードコンポーネント
function SuggestionCard({
  suggestions,
  onApply,
  canApply,
}: {
  suggestions: AIMessage["suggestions"];
  onApply: () => void;
  canApply: boolean;
}) {
  if (!suggestions) return null;

  if (suggestions.type === "breakdown") {
    const data = suggestions.data as BreakdownSuggestion;
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          📋 提案されたサブタスク:
        </div>
        <div className="space-y-1">
          {data.suggestions.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-white/50 dark:bg-slate-700/50 rounded px-2 py-1"
            >
              <span className="text-xs">•</span>
              <span className="text-xs flex-1">{s.label}</span>
              {s.estimatedHours && (
                <span className="text-[10px] text-slate-500">{s.estimatedHours}h</span>
              )}
            </div>
          ))}
        </div>
        {canApply && (
          <button
            onClick={onApply}
            className="w-full mt-2 px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
          >
            ✨ これらのタスクを追加
          </button>
        )}
      </div>
    );
  }

  if (suggestions.type === "actions") {
    const data = suggestions.data as ActionSuggestion;
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          👣 次のアクション:
        </div>
        <div className="space-y-2">
          {data.actions.map((a, i) => (
            <div
              key={i}
              className="bg-white/50 dark:bg-slate-700/50 rounded px-2 py-1.5"
            >
              <div className="text-xs font-medium">{a.action}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span>⏱ {a.duration}</span>
                {a.targetNode && <span>📌 {a.targetNode}</span>}
              </div>
            </div>
          ))}
        </div>
        {data.motivation && (
          <div className="text-xs text-blue-600 dark:text-blue-400 italic mt-2">
            💪 {data.motivation}
          </div>
        )}
      </div>
    );
  }

  return null;
}
