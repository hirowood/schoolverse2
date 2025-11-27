-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "pomodoroBreakMinutes" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "pomodoroEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pomodoroWorkMinutes" INTEGER NOT NULL DEFAULT 25;
