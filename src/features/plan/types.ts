export type StudyTask = {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string | null;
  status: "todo" | "in_progress" | "paused" | "done";
  parentId?: string | null;
  totalWorkTime: number;        // 累計作業時間（秒）
  lastStartedAt?: string | null; // 最後に作業を開始した時刻
  children?: StudyTask[];
};
