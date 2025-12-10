-- AlterTable
ALTER TABLE "VirtualRoom" ALTER COLUMN "spawnPosition" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "Whiteboard" ALTER COLUMN "elements" SET DEFAULT '{}'::jsonb,
ALTER COLUMN "appState" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "WhiteboardSnapshot" ALTER COLUMN "elements" SET DEFAULT '{}'::jsonb,
ALTER COLUMN "appState" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "CurriculumLesson" (
    "id" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "unitId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "lessonType" TEXT NOT NULL DEFAULT 'lecture',
    "order" INTEGER NOT NULL DEFAULT 0,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 60,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "bonusXp" INTEGER NOT NULL DEFAULT 0,
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resources" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'locked',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER,
    "notes" TEXT,
    "rating" INTEGER,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "bonusXpEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCurriculumStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalLessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "totalXpFromCurriculum" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStudiedAt" TIMESTAMP(3),
    "lineProgress" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCurriculumStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumLesson_slug_key" ON "CurriculumLesson"("slug");

-- CreateIndex
CREATE INDEX "CurriculumLesson_lineId_idx" ON "CurriculumLesson"("lineId");

-- CreateIndex
CREATE INDEX "CurriculumLesson_lineId_order_idx" ON "CurriculumLesson"("lineId", "order");

-- CreateIndex
CREATE INDEX "CurriculumLesson_slug_idx" ON "CurriculumLesson"("slug");

-- CreateIndex
CREATE INDEX "UserLessonProgress_userId_status_idx" ON "UserLessonProgress"("userId", "status");

-- CreateIndex
CREATE INDEX "UserLessonProgress_userId_completedAt_idx" ON "UserLessonProgress"("userId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserLessonProgress_userId_lessonId_key" ON "UserLessonProgress"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCurriculumStats_userId_key" ON "UserCurriculumStats"("userId");

-- AddForeignKey
ALTER TABLE "UserLessonProgress" ADD CONSTRAINT "UserLessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLessonProgress" ADD CONSTRAINT "UserLessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "CurriculumLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCurriculumStats" ADD CONSTRAINT "UserCurriculumStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
