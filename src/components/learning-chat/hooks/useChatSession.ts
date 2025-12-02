"use client";

import { useLearningChatContext } from "../LearningChatProvider";

export function useChatSession() {
  const {
    sessions,
    currentSession,
    selectSession,
    createSession,
    refreshSessions,
    modeFilter,
    setModeFilter,
  } = useLearningChatContext();

  return {
    sessions,
    currentSession,
    selectSession,
    createSession,
    refreshSessions,
    modeFilter,
    setModeFilter,
  };
}
