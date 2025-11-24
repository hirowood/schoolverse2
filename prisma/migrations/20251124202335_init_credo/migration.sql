-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CredoItem" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "CredoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CredoPracticeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credoId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "done" BOOLEAN NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CredoPracticeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "CredoPracticeLog_userId_date_idx" ON "CredoPracticeLog"("userId", "date");

-- CreateIndex
CREATE INDEX "CredoPracticeLog_userId_credoId_date_idx" ON "CredoPracticeLog"("userId", "credoId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CredoPracticeLog_userId_credoId_date_key" ON "CredoPracticeLog"("userId", "credoId", "date");

-- AddForeignKey
ALTER TABLE "CredoPracticeLog" ADD CONSTRAINT "CredoPracticeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredoPracticeLog" ADD CONSTRAINT "CredoPracticeLog_credoId_fkey" FOREIGN KEY ("credoId") REFERENCES "CredoItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

