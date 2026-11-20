-- CreateEnum
CREATE TYPE "HumanActionStatus" AS ENUM ('PENDING', 'DONE', 'CANCELLED');

-- AlterEnum
ALTER TYPE "TaskStatus" ADD VALUE 'WAITING_HUMAN';

-- CreateTable
CREATE TABLE "HumanActionRequest" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "status" "HumanActionStatus" NOT NULL DEFAULT 'PENDING',
    "result" JSONB,
    "completedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "HumanActionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformPost" (
    "id" TEXT NOT NULL,
    "contentProjectId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "approvalId" TEXT,
    "externalId" TEXT,
    "url" TEXT,
    "visibility" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "evidence" JSONB NOT NULL DEFAULT '{}',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HumanActionRequest_status_idx" ON "HumanActionRequest"("status");

-- CreateIndex
CREATE INDEX "HumanActionRequest_taskId_kind_inputHash_idx" ON "HumanActionRequest"("taskId", "kind", "inputHash");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformPost_idempotencyKey_key" ON "PlatformPost"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PlatformPost_contentProjectId_idx" ON "PlatformPost"("contentProjectId");

-- AddForeignKey
ALTER TABLE "HumanActionRequest" ADD CONSTRAINT "HumanActionRequest_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformPost" ADD CONSTRAINT "PlatformPost_contentProjectId_fkey" FOREIGN KEY ("contentProjectId") REFERENCES "ContentProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
