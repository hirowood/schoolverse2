-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "aiAnalysis" JSONB,
ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "analyzedAt" TIMESTAMP(3),
ADD COLUMN     "autoTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "ocrConfidence" DOUBLE PRECISION,
ADD COLUMN     "ocrRawText" TEXT;

-- CreateTable
CREATE TABLE "OcrHistory" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "processedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OcrHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OcrHistory_noteId_idx" ON "OcrHistory"("noteId");

-- AddForeignKey
ALTER TABLE "OcrHistory" ADD CONSTRAINT "OcrHistory_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
