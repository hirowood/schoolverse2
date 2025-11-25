const weeklyGoals = [
  "React Hooks の挙動をデモコードで理解する",
  "TypeScript Utility Types を活用して型安全にする",
  "毎日30分のAIプロンプト練習を続ける",
];

const todaysTasks = [
  "AIコーチに課題を投げてフィードバックをもらう",
  "ユニットテストを3件追加する",
  "振り返りノートを更新する",
];

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">学習プラン（Weekly Plan）</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-slate-900">今週のゴール</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          {weeklyGoals.map((goal) => (
            <li key={goal}>{goal}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-slate-900">今日のタスク</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          {todaysTasks.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
        <p className="text-xs text-slate-500">※ 本番運用ではAI生成・DB保存を予定</p>
      </section>
    </div>
  );
}
