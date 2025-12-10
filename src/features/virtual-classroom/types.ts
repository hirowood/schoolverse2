export type Vector3 = { x: number; y: number; z: number };

export type VirtualRoomSummary = {
  id: string;
  name: string;
  description?: string | null;
  type: "CLASSROOM" | "STUDY_GROUP" | "CONSULTATION" | "PRESENTATION" | string;
  maxParticipants: number;
  status: "WAITING" | "ACTIVE" | "PAUSED" | "ENDED" | string;
  isPublic: boolean;
  environmentId: string;
  spawnPosition?: Vector3 | null;
};

export type RoomParticipant = {
  id: string;
  userId: string;
  role: "HOST" | "TEACHER" | "STUDENT" | "OBSERVER" | string;
  displayName?: string | null;
  avatarId?: string | null;
  avatarColor?: string | null;
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationY: number;
  currentAction: string;
  isConnected: boolean;
};

export type MonsterRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | string;

export type MonsterDefinition = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  subcategory?: string | null;
  difficulty: number;
  rarity: MonsterRarity;
  baseXp: number;
  baseCoin: number;
  spriteUrl?: string | null;
  modelUrl?: string | null;
  color?: string | null;
  size?: number | null;
  minPlayerLevel: number;
  maxPlayerLevel?: number | null;
  spawnWeight: number;
  spawnZones: string[];
};

export type MonsterQuestionOption = { label: string; value: string; isCorrect?: boolean };

export type MonsterQuestion = {
  id: string;
  monsterId: string;
  questionText: string;
  questionType: "text" | "multiple_choice" | "fill_blank" | string;
  options?: MonsterQuestionOption[] | null;
  correctAnswer: string;
  explanation?: string | null;
  hints: string[];
  difficulty: number;
  timeLimit: number;
  bonusXp: number;
  tags?: string[] | null;
  isAiGenerated: boolean;
};

export type MonsterEncounter = {
  id: string;
  userId: string;
  monsterId: string;
  roomId?: string | null;
  questionText: string;
  questionType: string;
  options?: MonsterQuestionOption[] | null;
  correctAnswer: string;
  userAnswer?: string | null;
  isCorrect?: boolean | null;
  answeredAt?: string | null;
  timeSpentSec?: number | null;
  hintsUsed: number;
  xpEarned: number;
  bonusXpEarned: number;
  coinsEarned: number;
  status: "active" | "completed" | "fled" | "timeout" | string;
  position?: Vector3 | null;
  createdAt?: string | null;
};

export type SpawnZone = {
  id: string;
  roomId?: string | null;
  name: string;
  slug: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  spawnCategories: string[];
  spawnInterval: number;
  maxMonsters: number;
  difficultyMin: number;
  difficultyMax: number;
};
