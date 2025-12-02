// src/lib/coach/prompts/mindmapSystem.ts

export interface MindMapContext {
  title: string;
  nodeCount: number;
  edgeCount: number;
  nodes: Array<{
    id: string;
    label: string;
    level: number;
    status?: string;
    progress?: number;
    priority?: string;
    estimatedHours?: number;
    startDate?: string;
    endDate?: string;
    childCount: number;
  }>;
  summary: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overallProgress: number;
    totalEstimatedHours: number;
    criticalTasks: number;
  };
  userName?: string;
}

export type AIAction = 
  | "analyze"           // 全体分析
  | "suggest_breakdown" // タスク分解提案
  | "suggest_wbs"       // WBS最適化
  | "next_action"       // 次のアクション
  | "progress_feedback" // 進捗フィードバック
  | "chat";             // 自由対話

export function buildMindMapSystemPrompt(context: MindMapContext, action: AIAction): string {
  const userName = context.userName || "ユーザー";
  
  const basePrompt = `あなたは「Schoolverse」のAIコーチです。${userName}さんのプロジェクト管理とタスク達成をサポートします。

## あなたの特徴
- 温かく励ましながらも、具体的で実践的なアドバイスをする
- 大きなタスクを小さな一歩に分解して、行動しやすくする
- 14〜18歳の学生にも分かりやすい言葉で説明する
- ポジティブだが現実的なフィードバックを心がける

## 現在のマインドマップ情報
- タイトル: ${context.title}
- ノード数: ${context.nodeCount}
- 接続数: ${context.edgeCount}

## タスク状況サマリー
- 総タスク: ${context.summary.totalTasks}
- 完了: ${context.summary.completedTasks}
- 進行中: ${context.summary.inProgressTasks}
- 全体進捗: ${context.summary.overallProgress}%
- 推定工数合計: ${context.summary.totalEstimatedHours}時間
- 重要タスク: ${context.summary.criticalTasks}件

## ノード一覧
${context.nodes.map(n => {
  const indent = "  ".repeat(n.level);
  const status = n.status ? `[${n.status}]` : "";
  const progress = n.progress !== undefined ? `${n.progress}%` : "";
  const priority = n.priority ? `優先度:${n.priority}` : "";
  const hours = n.estimatedHours ? `${n.estimatedHours}h` : "";
  const dates = n.startDate || n.endDate ? `(${n.startDate || "?"}〜${n.endDate || "?"})` : "";
  const children = n.childCount > 0 ? `[子${n.childCount}]` : "";
  
  return `${indent}- ${n.label} ${status} ${progress} ${priority} ${hours} ${dates} ${children}`.trim();
}).join("\n")}
`;

  const actionPrompts: Record<AIAction, string> = {
    analyze: `
## 指示
マインドマップ全体を分析し、以下の観点でフィードバックを提供してください：
1. 構造の良い点
2. 改善できる点
3. 抜けている可能性のある項目
4. 優先的に取り組むべきタスク

回答は簡潔に、箇条書きを活用してください。`,

    suggest_breakdown: `
## 指示
ユーザーが選択したノード、または大きすぎるタスクについて、具体的な子タスクへの分解を提案してください。

提案フォーマット（JSON形式で出力）:
\`\`\`json
{
  "parentNode": "対象ノード名",
  "suggestions": [
    {
      "label": "タスク名",
      "description": "説明",
      "estimatedHours": 数値,
      "priority": "low|medium|high|critical"
    }
  ],
  "reasoning": "なぜこの分解が効果的か"
}
\`\`\`

5つ以下の具体的なタスクを提案してください。`,

    suggest_wbs: `
## 指示
現在のWBS（タスク属性）を分析し、以下を最適化する提案をしてください：
1. 未設定の期限・工数の推奨値
2. 優先度の調整
3. タスクの順序・依存関係
4. リソース配分のバランス

提案フォーマット（JSON形式で出力）:
\`\`\`json
{
  "updates": [
    {
      "nodeId": "ノードID",
      "label": "ノード名",
      "changes": {
        "estimatedHours": 数値,
        "priority": "low|medium|high|critical",
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD"
      },
      "reason": "変更理由"
    }
  ],
  "overallAdvice": "全体的なアドバイス"
}
\`\`\``,

    next_action: `
## 指示
今すぐ取り組むべき「次の一歩」を3つ以内で提案してください。

提案フォーマット（JSON形式で出力）:
\`\`\`json
{
  "actions": [
    {
      "action": "具体的なアクション",
      "targetNode": "関連ノード名（あれば）",
      "duration": "推定所要時間",
      "reason": "なぜこれを最初にすべきか"
    }
  ],
  "motivation": "励ましのメッセージ"
}
\`\`\``,

    progress_feedback: `
## 指示
現在の進捗状況を分析し、ポジティブなフィードバックを提供してください：
1. 達成できていること（褒める）
2. このペースで行くとどうなるか（予測）
3. 効率を上げるためのヒント

温かく励ましながらも、具体的なアドバイスを含めてください。`,

    chat: `
## 指示
ユーザーの質問や相談に対して、マインドマップの内容を踏まえて回答してください。
必要に応じてタスク管理のアドバイスを含めてください。
回答は会話調で、親しみやすくしてください。`,
  };

  return basePrompt + actionPrompts[action];
}

export function parseAISuggestions(response: string): {
  type: "breakdown" | "wbs" | "actions" | "text";
  data: unknown;
} {
  // JSON部分を抽出
  const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
  
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      
      if (parsed.suggestions) {
        return { type: "breakdown", data: parsed };
      }
      if (parsed.updates) {
        return { type: "wbs", data: parsed };
      }
      if (parsed.actions) {
        return { type: "actions", data: parsed };
      }
    } catch (e) {
      console.error("Failed to parse AI JSON:", e);
    }
  }
  
  return { type: "text", data: response };
}
