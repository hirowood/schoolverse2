export type StudyTask = {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string | null;
  status: "todo" | "in_progress" | "done";
  parentId?: string | null;
  children?: StudyTask[];
};
