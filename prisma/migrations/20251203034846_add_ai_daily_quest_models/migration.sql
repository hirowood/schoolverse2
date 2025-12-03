-- CreateTable
CREATE TABLE "UserGoals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grade" TEXT,
    "birthDate" TIMESTAMP(3),
    "strongSubjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weakSubjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dreamJob" TEXT,
    "dreamJobReason" TEXT,
    "targetSchool" TEXT,
    "targetDepartment" TEXT,
    "examType" TEXT,
    "yearlyGoal" TEXT,
    "monthlyGoal" TEXT,
    "weeklyGoal" TEXT,
    "preferredStudyTime" TEXT,
    "studyDurationMinutes" INTEGER,
    "learningStyle" TEXT,
    "preferredEnvironment" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentChallenges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetSleepHours" DOUBLE PRECISION,
    "targetWakeUpTime" TEXT,
    "targetBedTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGoals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCondition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "physicalCondition" INTEGER NOT NULL,
    "mentalCondition" INTEGER NOT NULL,
    "motivationLevel" INTEGER NOT NULL,
    "energyLevel" INTEGER NOT NULL,
    "stressLevel" INTEGER,
    "sleepHours" DOUBLE PRECISION,
    "sleepQuality" INTEGER,
    "wakeUpFeeling" INTEGER,
    "hasImportantEvent" BOOLEAN NOT NULL DEFAULT false,
    "eventDescription" TEXT,
    "notes" TEXT,
    "worriesOrConcerns" TEXT,
    "inputTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLifeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "wakeUpTime" TIMESTAMP(3),
    "bedTime" TIMESTAMP(3),
    "actualSleepHours" DOUBLE PRECISION,
    "sleepQuality" INTEGER,
    "hadNap" BOOLEAN NOT NULL DEFAULT false,
    "napDurationMin" INTEGER,
    "hadBreakfast" BOOLEAN NOT NULL DEFAULT false,
    "breakfastTime" TIMESTAMP(3),
    "breakfastQuality" INTEGER,
    "hadLunch" BOOLEAN NOT NULL DEFAULT false,
    "lunchTime" TIMESTAMP(3),
    "lunchQuality" INTEGER,
    "hadDinner" BOOLEAN NOT NULL DEFAULT false,
    "dinnerTime" TIMESTAMP(3),
    "dinnerQuality" INTEGER,
    "snackCount" INTEGER NOT NULL DEFAULT 0,
    "waterIntakeMl" INTEGER,
    "caffeineIntake" INTEGER,
    "exerciseMinutes" INTEGER,
    "exerciseType" TEXT,
    "stepsCount" INTEGER,
    "roomCleaned" BOOLEAN NOT NULL DEFAULT false,
    "madebed" BOOLEAN NOT NULL DEFAULT false,
    "tookShower" BOOLEAN NOT NULL DEFAULT false,
    "wentOutside" BOOLEAN NOT NULL DEFAULT false,
    "gotSunlight" BOOLEAN NOT NULL DEFAULT false,
    "totalScreenTimeMin" INTEGER,
    "studyScreenTimeMin" INTEGER,
    "snsScreenTimeMin" INTEGER,
    "gameScreenTimeMin" INTEGER,
    "morningMood" INTEGER,
    "afternoonMood" INTEGER,
    "eveningMood" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLifeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningAttitudeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "focusSessionsCount" INTEGER NOT NULL DEFAULT 0,
    "totalFocusMinutes" INTEGER NOT NULL DEFAULT 0,
    "longestFocusMinutes" INTEGER NOT NULL DEFAULT 0,
    "averageFocusMinutes" DOUBLE PRECISION,
    "distractionCount" INTEGER NOT NULL DEFAULT 0,
    "didPlanning" BOOLEAN NOT NULL DEFAULT false,
    "didPreview" BOOLEAN NOT NULL DEFAULT false,
    "didActiveListening" BOOLEAN NOT NULL DEFAULT false,
    "didReview" BOOLEAN NOT NULL DEFAULT false,
    "didSelfTest" BOOLEAN NOT NULL DEFAULT false,
    "didSpacedRepetition" BOOLEAN NOT NULL DEFAULT false,
    "setDailyGoal" BOOLEAN NOT NULL DEFAULT false,
    "achievedDailyGoal" BOOLEAN NOT NULL DEFAULT false,
    "goalAchievementRate" DOUBLE PRECISION,
    "didReflection" BOOLEAN NOT NULL DEFAULT false,
    "reflectionNote" TEXT,
    "questionsAsked" INTEGER NOT NULL DEFAULT 0,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "questionsList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "confusionPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "studyLocation" TEXT,
    "studyWithOthers" BOOLEAN NOT NULL DEFAULT false,
    "usedTimer" BOOLEAN NOT NULL DEFAULT false,
    "subjectsStudied" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mainSubject" TEXT,
    "mainSubjectMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningAttitudeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteQualityLog" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hasTitle" BOOLEAN NOT NULL DEFAULT false,
    "hasHeadings" BOOLEAN NOT NULL DEFAULT false,
    "headingCount" INTEGER NOT NULL DEFAULT 0,
    "hasBulletPoints" BOOLEAN NOT NULL DEFAULT false,
    "hasNumberedList" BOOLEAN NOT NULL DEFAULT false,
    "hasTable" BOOLEAN NOT NULL DEFAULT false,
    "hasHighlights" BOOLEAN NOT NULL DEFAULT false,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "sentenceCount" INTEGER NOT NULL DEFAULT 0,
    "paragraphCount" INTEGER NOT NULL DEFAULT 0,
    "imageCount" INTEGER NOT NULL DEFAULT 0,
    "linkCount" INTEGER NOT NULL DEFAULT 0,
    "codeBlockCount" INTEGER NOT NULL DEFAULT 0,
    "usedTemplate" TEXT,
    "templateCompletion" DOUBLE PRECISION,
    "tagCount" INTEGER NOT NULL DEFAULT 0,
    "hasCategory" BOOLEAN NOT NULL DEFAULT false,
    "hasSubject" BOOLEAN NOT NULL DEFAULT false,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "editCount" INTEGER NOT NULL DEFAULT 0,
    "addedAfterCreation" BOOLEAN NOT NULL DEFAULT false,
    "aiQualityScore" INTEGER,
    "aiCompleteness" INTEGER,
    "aiClarity" INTEGER,
    "aiOrganization" INTEGER,
    "aiSuggestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "overallScore" INTEGER,
    "qualityLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteQualityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitTracker" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "category" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "customDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "targetCount" INTEGER NOT NULL DEFAULT 1,
    "targetTime" TEXT,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderTime" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "streakBonusXp" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "pausedUntil" TIMESTAMP(3),
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalCompletions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HabitTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitCompletion" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "count" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "skippedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HabitCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIGeneratedQuest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "estimatedMinutes" INTEGER,
    "xpReward" INTEGER NOT NULL,
    "bonusXp" INTEGER,
    "reason" TEXT NOT NULL,
    "tips" TEXT,
    "relatedGoal" TEXT,
    "relatedCredo" TEXT,
    "relatedData" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "acceptedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "skippedAt" TIMESTAMP(3),
    "completionNote" TEXT,
    "completionRating" INTEGER,
    "actualMinutes" INTEGER,
    "skippedReason" TEXT,
    "isRegenerated" BOOLEAN NOT NULL DEFAULT false,
    "originalQuestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIGeneratedQuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestGenerationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "contextSnapshot" JSONB NOT NULL,
    "promptUsed" TEXT NOT NULL,
    "rawResponse" TEXT NOT NULL,
    "parsedQuests" JSONB NOT NULL,
    "questCount" INTEGER NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "generationTimeMs" INTEGER,
    "hadError" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestGenerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGoals_userId_key" ON "UserGoals"("userId");

-- CreateIndex
CREATE INDEX "DailyCondition_userId_date_idx" ON "DailyCondition"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCondition_userId_date_key" ON "DailyCondition"("userId", "date");

-- CreateIndex
CREATE INDEX "DailyLifeLog_userId_date_idx" ON "DailyLifeLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLifeLog_userId_date_key" ON "DailyLifeLog"("userId", "date");

-- CreateIndex
CREATE INDEX "LearningAttitudeLog_userId_date_idx" ON "LearningAttitudeLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "LearningAttitudeLog_userId_date_key" ON "LearningAttitudeLog"("userId", "date");

-- CreateIndex
CREATE INDEX "NoteQualityLog_userId_idx" ON "NoteQualityLog"("userId");

-- CreateIndex
CREATE INDEX "NoteQualityLog_noteId_idx" ON "NoteQualityLog"("noteId");

-- CreateIndex
CREATE INDEX "HabitTracker_userId_idx" ON "HabitTracker"("userId");

-- CreateIndex
CREATE INDEX "HabitTracker_userId_isActive_idx" ON "HabitTracker"("userId", "isActive");

-- CreateIndex
CREATE INDEX "HabitCompletion_habitId_date_idx" ON "HabitCompletion"("habitId", "date");

-- CreateIndex
CREATE INDEX "HabitCompletion_userId_date_idx" ON "HabitCompletion"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "HabitCompletion_habitId_date_key" ON "HabitCompletion"("habitId", "date");

-- CreateIndex
CREATE INDEX "AIGeneratedQuest_userId_date_idx" ON "AIGeneratedQuest"("userId", "date");

-- CreateIndex
CREATE INDEX "AIGeneratedQuest_userId_status_idx" ON "AIGeneratedQuest"("userId", "status");

-- CreateIndex
CREATE INDEX "AIGeneratedQuest_userId_date_status_idx" ON "AIGeneratedQuest"("userId", "date", "status");

-- CreateIndex
CREATE INDEX "QuestGenerationLog_userId_date_idx" ON "QuestGenerationLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "UserGoals" ADD CONSTRAINT "UserGoals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCondition" ADD CONSTRAINT "DailyCondition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLifeLog" ADD CONSTRAINT "DailyLifeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningAttitudeLog" ADD CONSTRAINT "LearningAttitudeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteQualityLog" ADD CONSTRAINT "NoteQualityLog_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteQualityLog" ADD CONSTRAINT "NoteQualityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitTracker" ADD CONSTRAINT "HabitTracker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitCompletion" ADD CONSTRAINT "HabitCompletion_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "HabitTracker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIGeneratedQuest" ADD CONSTRAINT "AIGeneratedQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestGenerationLog" ADD CONSTRAINT "QuestGenerationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
