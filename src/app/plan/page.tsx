const weeklyGoals = [
  "React Hooks の復習を完了する",
  "TypeScript Utility Types を実践で使う",
  "毎日30分の英語インプットを継続する",
];

const todaysTasks = [
  "AIコーチに質問を送り、フィードバックをもらう",
  "ユニットテストを3件追加する",
  "読書ノートを更新する",
];

export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">学習計画（Weekly Plan）</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-slate-900">今週の目標</h2>
        <ul className="list-disc pl-5 text-slate-700 space-y-1">
          {weeklyGoals.map((goal) => (
            <li key={goal}>{goal}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-slate-900">今日のタスク</h2>
        <ul className="list-disc pl-5 text-slate-700 space-y-1">
          {todaysTasks.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
