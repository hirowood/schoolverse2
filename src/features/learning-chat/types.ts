export enum LearningCategory {
  PROGRAMMING_BASIC = "programming_basic",
  PROGRAMMING_WEB = "programming_web",
  PROGRAMMING_MOBILE = "programming_mobile",
  AI_PROMPT = "ai_prompt",
  AI_VIBE_CODING = "ai_vibe_coding",
  AI_DRIVEN_DEV = "ai_driven_dev",
  AI_ML = "ai_ml",
  AX = "ax",
  DX = "dx",
  APP_PLANNING = "app_planning",
  APP_REQUIREMENTS = "app_requirements",
  APP_DESIGN = "app_design",
  APP_IMPLEMENTATION = "app_implementation",
  APP_TESTING = "app_testing",
  APP_DEPLOY = "app_deploy",
  OFFICE_EXCEL = "office_excel",
  OFFICE_VBA = "office_vba",
  OFFICE_WORD = "office_word",
  OFFICE_SPREADSHEET = "office_spreadsheet",
  OFFICE_GAS = "office_gas",
  PYTHON_BASIC = "python_basic",
  PYTHON_DATA = "python_data",
  PYTHON_AUTOMATION = "python_automation",
}

export enum ChatMode {
  LEARNING = "learning",
  CAREER = "career",
  GENERAL = "general",
}

export type LearningChatSession = {
  id: string;
  userId: string;
  title: string;
  mode: ChatMode | string;
  category?: LearningCategory | string | null;
  contextSummary?: string | null;
  totalTokens: number;
  isActive: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LearningChatMessage = {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokenCount: number;
  model?: string | null;
  rating?: number | null;
  feedback?: string | null;
  category?: LearningCategory | string | null;
  codeBlocks?: { blocks: Array<{ language: string; code: string }> } | null;
  createdAt: string;
};

export type SessionListResponse = {
  sessions: LearningChatSession[];
  nextCursor: string | null;
};

export type MessagesListResponse = {
  messages: LearningChatMessage[];
  hasMore: boolean;
};

export type CreateSessionPayload = {
  mode: ChatMode;
  category?: LearningCategory;
  initialMessage?: string;
};

export type UpdateSessionPayload = {
  title?: string;
  isPinned?: boolean;
  isActive?: boolean;
  category?: LearningCategory;
};

export type SendMessagePayload = {
  content: string;
  category?: LearningCategory;
};

/**
 * SSE event contract for streaming responses.
 * Server route: `POST /api/learning-chat/sessions/[sessionId]/messages`
 */
export type LearningChatStreamEvent =
  | { type: "delta"; content: string }
  | { type: "done"; messageId?: string }
  | { type: "error"; message: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * Runtime parser for SSE events.
 * - Returns `null` for unknown/malformed payloads so the UI can safely ignore them.
 */
export function parseLearningChatStreamEvent(raw: unknown): LearningChatStreamEvent | null {
  if (!isRecord(raw)) return null;

  const type = raw.type;
  if (type === "delta") {
    return typeof raw.content === "string" ? { type: "delta", content: raw.content } : null;
  }
  if (type === "done") {
    return typeof raw.messageId === "string" ? { type: "done", messageId: raw.messageId } : { type: "done" };
  }
  if (type === "error") {
    return typeof raw.message === "string" ? { type: "error", message: raw.message } : null;
  }

  return null;
}

export const MODE_LABEL: Record<ChatMode, string> = {
  [ChatMode.LEARNING]: "Learning",
  [ChatMode.CAREER]: "Career",
  [ChatMode.GENERAL]: "General",
};

export const CATEGORY_LABEL: Partial<Record<LearningCategory, string>> = {
  [LearningCategory.PROGRAMMING_BASIC]: "Programming Basic",
  [LearningCategory.PROGRAMMING_WEB]: "Web Development",
  [LearningCategory.PROGRAMMING_MOBILE]: "Mobile Development",
  [LearningCategory.AI_PROMPT]: "Prompt Engineering",
  [LearningCategory.AI_VIBE_CODING]: "Vibe Coding",
  [LearningCategory.AI_DRIVEN_DEV]: "AI Driven Dev",
  [LearningCategory.AI_ML]: "Machine Learning",
  [LearningCategory.AX]: "AX",
  [LearningCategory.DX]: "DX",
  [LearningCategory.APP_PLANNING]: "App Planning",
  [LearningCategory.APP_REQUIREMENTS]: "Requirements",
  [LearningCategory.APP_DESIGN]: "Detail Design",
  [LearningCategory.APP_IMPLEMENTATION]: "Implementation",
  [LearningCategory.APP_TESTING]: "Testing",
  [LearningCategory.APP_DEPLOY]: "Deployment",
  [LearningCategory.OFFICE_EXCEL]: "Excel",
  [LearningCategory.OFFICE_VBA]: "VBA",
  [LearningCategory.OFFICE_WORD]: "Word",
  [LearningCategory.OFFICE_SPREADSHEET]: "Spreadsheet",
  [LearningCategory.OFFICE_GAS]: "GAS",
  [LearningCategory.PYTHON_BASIC]: "Python Basic",
  [LearningCategory.PYTHON_DATA]: "Data Analysis",
  [LearningCategory.PYTHON_AUTOMATION]: "Automation",
};

export const CATEGORY_OPTIONS: Array<{ label: string; value: LearningCategory }> = Object.entries(
  CATEGORY_LABEL,
).map(([value, label]) => ({ value: value as LearningCategory, label: label ?? value }));
