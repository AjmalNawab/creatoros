-- Archive flag for finished content projects (hidden from default lists; nothing is deleted).
ALTER TABLE "ContentProject" ADD COLUMN "archivedAt" TIMESTAMP(3);
