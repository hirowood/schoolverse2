-- AlterTable
ALTER TABLE "VirtualRoom" ALTER COLUMN "spawnPosition" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "Whiteboard" ALTER COLUMN "elements" SET DEFAULT '{}'::jsonb,
ALTER COLUMN "appState" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "WhiteboardSnapshot" ALTER COLUMN "elements" SET DEFAULT '{}'::jsonb,
ALTER COLUMN "appState" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "MonsterDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "baseXp" INTEGER NOT NULL DEFAULT 10,
    "baseCoin" INTEGER NOT NULL DEFAULT 5,
    "spriteUrl" TEXT,
    "modelUrl" TEXT,
    "color" TEXT NOT NULL DEFAULT '#94a3b8',
    "size" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "animations" JSONB,
    "minPlayerLevel" INTEGER NOT NULL DEFAULT 1,
    "maxPlayerLevel" INTEGER,
    "spawnWeight" INTEGER NOT NULL DEFAULT 100,
    "spawnZones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonsterDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterQuestion" (
    "id" TEXT NOT NULL,
    "monsterId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'multiple_choice',
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "hints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "codeSnippet" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "timeLimit" INTEGER NOT NULL DEFAULT 60,
    "bonusXp" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "correctRate" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonsterQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonsterEncounter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monsterId" TEXT NOT NULL,
    "roomId" TEXT,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "userAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "answeredAt" TIMESTAMP(3),
    "timeSpentSec" INTEGER,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "bonusXpEarned" INTEGER NOT NULL DEFAULT 0,
    "coinsEarned" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "positionX" DOUBLE PRECISION,
    "positionY" DOUBLE PRECISION,
    "positionZ" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonsterEncounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMonsterStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalEncounters" INTEGER NOT NULL DEFAULT 0,
    "totalDefeated" INTEGER NOT NULL DEFAULT 0,
    "totalFled" INTEGER NOT NULL DEFAULT 0,
    "totalTimeout" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "wrongAnswers" INTEGER NOT NULL DEFAULT 0,
    "totalXpFromMonsters" INTEGER NOT NULL DEFAULT 0,
    "totalCoinsFromMonsters" INTEGER NOT NULL DEFAULT 0,
    "categoryStats" JSONB NOT NULL DEFAULT '{}',
    "rarityStats" JSONB NOT NULL DEFAULT '{}',
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMonsterStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpawnZone" (
    "id" TEXT NOT NULL,
    "roomId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "minX" DOUBLE PRECISION NOT NULL,
    "maxX" DOUBLE PRECISION NOT NULL,
    "minY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxY" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "minZ" DOUBLE PRECISION NOT NULL,
    "maxZ" DOUBLE PRECISION NOT NULL,
    "spawnCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "spawnInterval" INTEGER NOT NULL DEFAULT 30,
    "maxMonsters" INTEGER NOT NULL DEFAULT 3,
    "difficultyMin" INTEGER NOT NULL DEFAULT 1,
    "difficultyMax" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpawnZone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonsterDefinition_slug_key" ON "MonsterDefinition"("slug");

-- CreateIndex
CREATE INDEX "MonsterDefinition_category_idx" ON "MonsterDefinition"("category");

-- CreateIndex
CREATE INDEX "MonsterDefinition_difficulty_idx" ON "MonsterDefinition"("difficulty");

-- CreateIndex
CREATE INDEX "MonsterDefinition_rarity_idx" ON "MonsterDefinition"("rarity");

-- CreateIndex
CREATE INDEX "MonsterQuestion_monsterId_idx" ON "MonsterQuestion"("monsterId");

-- CreateIndex
CREATE INDEX "MonsterQuestion_difficulty_idx" ON "MonsterQuestion"("difficulty");

-- CreateIndex
CREATE INDEX "MonsterEncounter_userId_createdAt_idx" ON "MonsterEncounter"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MonsterEncounter_userId_status_idx" ON "MonsterEncounter"("userId", "status");

-- CreateIndex
CREATE INDEX "MonsterEncounter_monsterId_idx" ON "MonsterEncounter"("monsterId");

-- CreateIndex
CREATE INDEX "MonsterEncounter_roomId_idx" ON "MonsterEncounter"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMonsterStats_userId_key" ON "UserMonsterStats"("userId");

-- CreateIndex
CREATE INDEX "SpawnZone_roomId_idx" ON "SpawnZone"("roomId");

-- AddForeignKey
ALTER TABLE "MonsterQuestion" ADD CONSTRAINT "MonsterQuestion_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterEncounter" ADD CONSTRAINT "MonsterEncounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterEncounter" ADD CONSTRAINT "MonsterEncounter_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterEncounter" ADD CONSTRAINT "MonsterEncounter_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "VirtualRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMonsterStats" ADD CONSTRAINT "UserMonsterStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpawnZone" ADD CONSTRAINT "SpawnZone_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "VirtualRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
