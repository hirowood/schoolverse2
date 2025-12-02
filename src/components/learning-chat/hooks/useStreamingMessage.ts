"use client";

import { useLearningChatContext } from "../LearningChatProvider";

export function useStreamingMessage() {
  const { isStreaming, error, clearError } = useLearningChatContext();
  return { isStreaming, error, clearError };
}
