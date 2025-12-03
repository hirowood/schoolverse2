-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('CLASSROOM', 'STUDY_GROUP', 'CONSULTATION', 'PRESENTATION');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('WAITING', 'ACTIVE', 'PAUSED', 'ENDED');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('HOST', 'TEACHER', 'STUDENT', 'OBSERVER');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'SYSTEM', 'QUESTION', 'FILE');

-- CreateTable
CREATE TABLE "VirtualRoom" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "type" "RoomType" NOT NULL,
    "maxParticipants" INTEGER NOT NULL DEFAULT 20,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "environmentId" TEXT NOT NULL DEFAULT 'default_classroom',
    "spawnPosition" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "allowVideo" BOOLEAN NOT NULL DEFAULT true,
    "allowAudio" BOOLEAN NOT NULL DEFAULT true,
    "allowScreenShare" BOOLEAN NOT NULL DEFAULT true,
    "allowChat" BOOLEAN NOT NULL DEFAULT true,
    "status" "RoomStatus" NOT NULL DEFAULT 'WAITING',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "scheduledEndAt" TIMESTAMP(3),
    "hostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomParticipant" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ParticipantRole" NOT NULL DEFAULT 'STUDENT',
    "avatarId" TEXT,
    "avatarColor" TEXT NOT NULL DEFAULT '#4F46E5',
    "displayName" VARCHAR(50),
    "positionX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "positionY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "positionZ" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "rotationY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentAction" TEXT NOT NULL DEFAULT 'idle',
    "currentSeatId" TEXT,
    "isVideoOn" BOOLEAN NOT NULL DEFAULT false,
    "isAudioOn" BOOLEAN NOT NULL DEFAULT false,
    "isSharingScreen" BOOLEAN NOT NULL DEFAULT false,
    "isHandRaised" BOOLEAN NOT NULL DEFAULT false,
    "isConnected" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "RoomParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Whiteboard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "elements" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "appState" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "allowedEditors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Whiteboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhiteboardSnapshot" (
    "id" TEXT NOT NULL,
    "whiteboardId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "elements" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "appState" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "thumbnailUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhiteboardSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "isQuestion" BOOLEAN NOT NULL DEFAULT false,
    "isAnswered" BOOLEAN NOT NULL DEFAULT false,
    "answeredBy" TEXT,
    "answeredAt" TIMESTAMP(3),
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomRecording" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "videoUrl" TEXT,
    "audioUrl" TEXT,
    "whiteboardData" JSONB,
    "duration" INTEGER,
    "fileSize" INTEGER,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomRecording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvatarTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "modelUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "customizable" JSONB,
    "defaultColor" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvatarTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VirtualRoom_hostId_idx" ON "VirtualRoom"("hostId");

-- CreateIndex
CREATE INDEX "VirtualRoom_status_idx" ON "VirtualRoom"("status");

-- CreateIndex
CREATE INDEX "VirtualRoom_type_idx" ON "VirtualRoom"("type");

-- CreateIndex
CREATE INDEX "VirtualRoom_isPublic_status_idx" ON "VirtualRoom"("isPublic", "status");

-- CreateIndex
CREATE INDEX "VirtualRoom_scheduledAt_idx" ON "VirtualRoom"("scheduledAt");

-- CreateIndex
CREATE INDEX "VirtualRoom_createdAt_idx" ON "VirtualRoom"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "RoomParticipant_roomId_idx" ON "RoomParticipant"("roomId");

-- CreateIndex
CREATE INDEX "RoomParticipant_userId_idx" ON "RoomParticipant"("userId");

-- CreateIndex
CREATE INDEX "RoomParticipant_roomId_isConnected_idx" ON "RoomParticipant"("roomId", "isConnected");

-- CreateIndex
CREATE UNIQUE INDEX "RoomParticipant_roomId_userId_key" ON "RoomParticipant"("roomId", "userId");

-- CreateIndex
CREATE INDEX "Whiteboard_roomId_idx" ON "Whiteboard"("roomId");

-- CreateIndex
CREATE INDEX "WhiteboardSnapshot_whiteboardId_idx" ON "WhiteboardSnapshot"("whiteboardId");

-- CreateIndex
CREATE INDEX "RoomMessage_roomId_createdAt_idx" ON "RoomMessage"("roomId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "RoomMessage_roomId_isQuestion_idx" ON "RoomMessage"("roomId", "isQuestion");

-- CreateIndex
CREATE INDEX "RoomMessage_senderId_idx" ON "RoomMessage"("senderId");

-- CreateIndex
CREATE INDEX "RoomRecording_roomId_idx" ON "RoomRecording"("roomId");

-- AddForeignKey
ALTER TABLE "VirtualRoom" ADD CONSTRAINT "VirtualRoom_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomParticipant" ADD CONSTRAINT "RoomParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "VirtualRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomParticipant" ADD CONSTRAINT "RoomParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Whiteboard" ADD CONSTRAINT "Whiteboard_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "VirtualRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardSnapshot" ADD CONSTRAINT "WhiteboardSnapshot_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "Whiteboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardSnapshot" ADD CONSTRAINT "WhiteboardSnapshot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMessage" ADD CONSTRAINT "RoomMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "VirtualRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMessage" ADD CONSTRAINT "RoomMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomRecording" ADD CONSTRAINT "RoomRecording_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "VirtualRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomRecording" ADD CONSTRAINT "RoomRecording_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
