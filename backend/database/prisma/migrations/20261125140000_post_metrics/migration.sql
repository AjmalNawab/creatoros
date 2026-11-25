-- Engagement snapshots per published post (append-only; null = unavailable, distinct from 0).
CREATE TABLE "PostMetric" (
    "id" TEXT NOT NULL,
    "platformPostId" TEXT NOT NULL,
    "brandId" TEXT,
    "source" TEXT NOT NULL,
    "views" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "saves" INTEGER,
    "reach" INTEGER,
    "watchTimeSec" INTEGER,
    "raw" JSONB NOT NULL DEFAULT '{}',
    "note" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostMetric_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PostMetric_platformPostId_capturedAt_idx" ON "PostMetric"("platformPostId", "capturedAt");
ALTER TABLE "PostMetric" ADD CONSTRAINT "PostMetric_platformPostId_fkey" FOREIGN KEY ("platformPostId") REFERENCES "PlatformPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Supabase API lockdown (see lock_down_supabase_api)
ALTER TABLE "PostMetric" ENABLE ROW LEVEL SECURITY;
