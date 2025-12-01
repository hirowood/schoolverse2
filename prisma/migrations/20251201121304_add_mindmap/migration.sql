-- CreateTable
CREATE TABLE "MindMap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '無題のマインドマップ',
    "description" TEXT,
    "viewportX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viewportY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viewportZoom" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "layoutType" TEXT NOT NULL DEFAULT 'radial',
    "noteId" TEXT,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "isShareable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MindMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MindMapNode" (
    "id" TEXT NOT NULL,
    "mindMapId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'mindMapNode',
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "borderColor" TEXT NOT NULL DEFAULT '#e2e8f0',
    "textColor" TEXT NOT NULL DEFAULT '#1e293b',
    "fontSize" INTEGER NOT NULL DEFAULT 14,
    "shape" TEXT NOT NULL DEFAULT 'rounded',
    "level" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "isCollapsed" BOOLEAN NOT NULL DEFAULT false,
    "linkedNoteId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MindMapNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MindMapEdge" (
    "id" TEXT NOT NULL,
    "mindMapId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'smoothstep',
    "strokeColor" TEXT NOT NULL DEFAULT '#94a3b8',
    "strokeWidth" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "animated" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MindMapEdge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MindMap_noteId_key" ON "MindMap"("noteId");

-- CreateIndex
CREATE INDEX "MindMap_userId_idx" ON "MindMap"("userId");

-- CreateIndex
CREATE INDEX "MindMap_noteId_idx" ON "MindMap"("noteId");

-- CreateIndex
CREATE INDEX "MindMapNode_mindMapId_idx" ON "MindMapNode"("mindMapId");

-- CreateIndex
CREATE INDEX "MindMapNode_parentId_idx" ON "MindMapNode"("parentId");

-- CreateIndex
CREATE INDEX "MindMapEdge_mindMapId_idx" ON "MindMapEdge"("mindMapId");

-- CreateIndex
CREATE INDEX "MindMapEdge_sourceId_idx" ON "MindMapEdge"("sourceId");

-- CreateIndex
CREATE INDEX "MindMapEdge_targetId_idx" ON "MindMapEdge"("targetId");

-- AddForeignKey
ALTER TABLE "MindMap" ADD CONSTRAINT "MindMap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindMap" ADD CONSTRAINT "MindMap_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindMapNode" ADD CONSTRAINT "MindMapNode_mindMapId_fkey" FOREIGN KEY ("mindMapId") REFERENCES "MindMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindMapEdge" ADD CONSTRAINT "MindMapEdge_mindMapId_fkey" FOREIGN KEY ("mindMapId") REFERENCES "MindMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindMapEdge" ADD CONSTRAINT "MindMapEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "MindMapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MindMapEdge" ADD CONSTRAINT "MindMapEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "MindMapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
