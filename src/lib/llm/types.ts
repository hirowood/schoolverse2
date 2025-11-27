// src/lib/llm/types.ts

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMClient {
  chat(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
  chatJSON<T>(messages: LLMMessage[], options?: LLMOptions): Promise<T>;
}
