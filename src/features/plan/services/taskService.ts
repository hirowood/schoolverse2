import { StudyTask } from "@/features/plan/types";

const TASKS_ENDPOINT = "/api/tasks";
const JSON_HEADERS = { "Content-Type": "application/json" };

const throwIfBadResponse = (res: Response) => {
  if (!res.ok) {
    throw new Error(`fetch failed ${res.status}`);
  }
};

const pullTasks = async (res: Response) => {
  throwIfBadResponse(res);
  const data = (await res.json()) as { tasks: StudyTask[] };
  return data.tasks;
};

export const fetchTasksByDate = async (date: string): Promise<StudyTask[]> => {
  const res = await fetch(`${TASKS_ENDPOINT}?date=${date}`);
  return pullTasks(res);
};

export const fetchAllTasks = async (): Promise<StudyTask[]> => {
  const res = await fetch(TASKS_ENDPOINT);
  return pullTasks(res);
};

export const patchTask = (payload: Record<string, unknown>) =>
  fetch(TASKS_ENDPOINT, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

export const createTask = (payload: Record<string, unknown>) =>
  fetch(TASKS_ENDPOINT, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

export const deleteTask = (id: string) =>
  fetch(TASKS_ENDPOINT, {
    method: "DELETE",
    headers: JSON_HEADERS,
    body: JSON.stringify({ id }),
  });
