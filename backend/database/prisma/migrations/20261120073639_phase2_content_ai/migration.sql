-- CreateEnum
CREATE TYPE "AiRequestStatus" AS ENUM ('PENDING', 'ANSWERED', 'CONSUMED', 'REJECTED');

-- AlterEnum
ALTER TYPE "RunStatus" ADD VALUE 'DEFERRED';

-- AlterEnum
ALTER TYPE "TaskStatus" ADD VALUE 'WAITING_AI';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "contentProjectId" TEXT;

-- CreateTable
CREATE TABLE "ContentProject" (
    "id" TEXT NOT NULL,
    "brandId" TEXT,
    "key" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'ur',
    "status" TEXT NOT NULL DEFAULT 'in_production',
    "params" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiRequest" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT,
    "status" "AiRequestStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'operator',
    "answeredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "AiRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentProject_key_key" ON "ContentProject"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ContentProject_slug_key" ON "ContentProject"("slug");

-- CreateIndex
CREATE INDEX "AiRequest_status_idx" ON "AiRequest"("status");

-- CreateIndex
CREATE INDEX "AiRequest_taskId_kind_inputHash_idx" ON "AiRequest"("taskId", "kind", "inputHash");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_contentProjectId_fkey" FOREIGN KEY ("contentProjectId") REFERENCES "ContentProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentProject" ADD CONSTRAINT "ContentProject_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRequest" ADD CONSTRAINT "AiRequest_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
