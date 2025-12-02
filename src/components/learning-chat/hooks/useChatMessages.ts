"use client";

import { useLearningChatContext } from "../LearningChatProvider";

export function useChatMessages() {
  const {
    messages,
    sendMessage,
    loadMoreMessages,
    isLoadingMessages,
    isStreaming,
    hasMoreMessages,
    selectedCategory,
    setSelectedCategory,
  } = useLearningChatContext();

  return {
    messages,
    sendMessage,
    loadMoreMessages,
    isLoadingMessages,
    isStreaming,
    hasMoreMessages,
    selectedCategory,
    setSelectedCategory,
  };
}
