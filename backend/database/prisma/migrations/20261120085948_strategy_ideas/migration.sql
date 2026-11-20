-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('PROPOSED', 'SELECTED', 'REJECTED');

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "brandId" TEXT,
    "taskId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "angle" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "whyNow" TEXT NOT NULL,
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "competition" TEXT NOT NULL,
    "keywords" JSONB NOT NULL DEFAULT '[]',
    "format" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "platforms" JSONB NOT NULL DEFAULT '["youtube"]',
    "score" INTEGER NOT NULL,
    "status" "IdeaStatus" NOT NULL DEFAULT 'PROPOSED',
    "contentProjectId" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Idea_contentProjectId_key" ON "Idea"("contentProjectId");

-- CreateIndex
CREATE INDEX "Idea_status_idx" ON "Idea"("status");

-- CreateIndex
CREATE INDEX "Idea_taskId_idx" ON "Idea"("taskId");

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
