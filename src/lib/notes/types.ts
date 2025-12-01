export type NoteTemplateType = "free" | "5w2h" | "5why" | "canvas" | "fact-feeling";

export interface NoteImageFile {
  id: string;
  url: string; // Base64 or storage URL
  name: string;
  width: number;
  height: number;
}

export interface NoteOcrText {
  imageId: string;
  text: string;
  confidence: number;
  position?: { x: number; y: number };
}

export interface Template5W2H {
  what: string;
  why: string;
  who: string;
  when: string;
  where: string;
  how: string;
  howMuch: string;
}

export interface Template5Why {
  problem: string;
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5: string;
  conclusion: string;
}

// 感情と事実を分けるテンプレート
export interface TemplateFactFeeling {
  situation: string;    // 状況：何が起きたか
  facts: string;        // 事実：客観的に見たこと・聞いたこと
  feelings: string;     // 感情：どう感じたか
  thoughts: string;     // 思考：どう解釈・判断したか
  needs: string;        // ニーズ：本当に求めていること
  actions: string;      // 行動：これからどうするか
}

export interface NoteRecord {
  id: string;
  userId: string;
  title: string | null;
  content: string | null;
  drawingData: object | null;
  imageFiles: NoteImageFile[];
  ocrTexts: NoteOcrText[];
  ocrRawText?: string | null;
  ocrConfidence?: number | null;
  aiSummary?: string | null;
  aiAnalysis?: Record<string, unknown> | null;
  autoTags?: string[];
  analyzedAt?: string | null;
  templateType: NoteTemplateType | null;
  templateData: Template5W2H | Template5Why | TemplateFactFeeling | null;
  tags: string[];
  isShareable: boolean;
  createdAt: string;
  updatedAt: string;
  relatedTaskId: string | null;
  relatedTaskTitle: string | null;
}

export interface CreateNoteRequest {
  title?: string;
  content?: string;
  drawingData?: object;
  templateType?: NoteTemplateType;
  templateData?: Template5W2H | Template5Why | TemplateFactFeeling;
  tags?: string[];
  relatedTaskId?: string;
  isShareable?: boolean;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  drawingData?: object | null;
  templateData?: Template5W2H | Template5Why | TemplateFactFeeling | null;
  tags?: string[] | null;
  relatedTaskId?: string | null;
  isShareable?: boolean;
}
