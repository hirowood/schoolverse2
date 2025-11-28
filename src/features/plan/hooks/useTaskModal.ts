import { useCallback, useState } from "react";
import type { StudyTask } from "@/features/plan/types";

export const createChildDraft = (date: string) => ({ title: "", description: "", date, time: "" });

type UseTaskModalResult = {
  modalOpen: boolean;
  editingTaskId: string | null;
  newTitle: string;
  setNewTitle: (value: string) => void;
  newDescription: string;
  setNewDescription: (value: string) => void;
  newDate: string;
  setNewDate: (value: string) => void;
  newTime: string;
  setNewTime: (value: string) => void;
  parentId: string | null;
  editingChildren: StudyTask[];
  setEditingChildren: (value: StudyTask[] | ((prev: StudyTask[]) => StudyTask[])) => void;
  showChildForm: boolean;
  setShowChildForm: (value: boolean | ((prev: boolean) => boolean)) => void;
  childDrafts: { title: string; description: string; date: string; time: string }[];
  setChildDrafts: (
    value:
      | { title: string; description: string; date: string; time: string }[]
      | ((prev: { title: string; description: string; date: string; time: string }[]) => { title: string; description: string; date: string; time: string }[]),
  ) => void;
  childSaving: boolean;
  setChildSaving: (value: boolean) => void;
  openModalForDate: (date: string) => void;
  openEditModal: (task: StudyTask) => void;
  openAddChild: (task: StudyTask) => void;
  closeTaskModal: () => void;
  resetForm: () => void;
};

export const useTaskModal = (today: string): UseTaskModalResult => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDate, setNewDate] = useState(today);
  const [newTime, setNewTime] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [editingChildren, setEditingChildren] = useState<StudyTask[]>([]);
  const [showChildForm, setShowChildForm] = useState(false);
  const [childDrafts, setChildDrafts] = useState(() => [createChildDraft(today)]);
  const [childSaving, setChildSaving] = useState(false);

  const resetForm = useCallback(() => {
    setEditingTaskId(null);
    setNewTitle("");
    setNewDescription("");
    setNewDate(today);
    setNewTime("");
    setParentId(null);
    setEditingChildren([]);
    setShowChildForm(false);
    setChildDrafts([createChildDraft(today)]);
    setChildSaving(false);
  }, [today]);

  const openModalForDate = useCallback(
    (date: string) => {
      resetForm();
      setNewDate(date);
      setModalOpen(true);
    },
    [resetForm],
  );

  const openEditModal = useCallback(
    (task: StudyTask) => {
      const dueDate = task.dueDate ?? "";
      setEditingTaskId(task.id);
      setNewTitle(task.title);
      setNewDescription(task.description ?? "");
      setNewDate(dueDate ? dueDate.slice(0, 10) : today);
      setNewTime(dueDate ? dueDate.slice(11, 16) : "");
      setParentId(task.parentId ?? null);
      setEditingChildren(task.children ?? []);
      setShowChildForm(false);
      setChildDrafts([createChildDraft(dueDate ? dueDate.slice(0, 10) : today)]);
      setModalOpen(true);
    },
    [today],
  );

  const openAddChild = useCallback(
    (task: StudyTask) => {
      if (task.parentId) return;
      resetForm();
      setParentId(task.parentId ?? task.id);
      const dueDate = task.dueDate ?? "";
      setNewDate(dueDate ? dueDate.slice(0, 10) : today);
      setNewTime(dueDate ? dueDate.slice(11, 16) : "");
      setChildDrafts([createChildDraft(dueDate ? dueDate.slice(0, 10) : today)]);
      setModalOpen(true);
    },
    [resetForm, today],
  );

  const closeTaskModal = useCallback(() => {
    setModalOpen(false);
    resetForm();
  }, [resetForm]);

  return {
    modalOpen,
    editingTaskId,
    newTitle,
    setNewTitle,
    newDescription,
    setNewDescription,
    newDate,
    setNewDate,
    newTime,
    setNewTime,
    parentId,
    editingChildren,
    setEditingChildren,
    showChildForm,
    setShowChildForm,
    childDrafts,
    setChildDrafts,
    childSaving,
    setChildSaving,
    openModalForDate,
    openEditModal,
    openAddChild,
    closeTaskModal,
    resetForm,
  };
};
