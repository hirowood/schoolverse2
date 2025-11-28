-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "relatedTaskId" TEXT;

-- CreateIndex
CREATE INDEX "Note_userId_relatedTaskId_idx" ON "Note"("userId", "relatedTaskId");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_relatedTaskId_fkey" FOREIGN KEY ("relatedTaskId") REFERENCES "StudyTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
