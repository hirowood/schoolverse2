-- CreateTable
CREATE TABLE "LearningChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '新しい相談',
    "mode" TEXT NOT NULL DEFAULT 'learning',
    "category" TEXT,
    "contextSummary" TEXT,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "model" TEXT,
    "rating" INTEGER,
    "feedback" TEXT,
    "category" TEXT,
    "codeBlocks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemPromptTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "category" TEXT,
    "prompt" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemPromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningChatSession_userId_createdAt_idx" ON "LearningChatSession"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "LearningChatSession_userId_mode_idx" ON "LearningChatSession"("userId", "mode");

-- CreateIndex
CREATE INDEX "LearningChatMessage_sessionId_createdAt_idx" ON "LearningChatMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemPromptTemplate_mode_category_version_key" ON "SystemPromptTemplate"("mode", "category", "version");

-- AddForeignKey
ALTER TABLE "LearningChatSession" ADD CONSTRAINT "LearningChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningChatMessage" ADD CONSTRAINT "LearningChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LearningChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
