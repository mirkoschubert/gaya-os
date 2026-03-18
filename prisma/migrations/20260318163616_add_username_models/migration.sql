-- CreateTable
CREATE TABLE "UsernameBlacklist" (
    "id" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "UsernameBlacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsernameChangeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "oldUsername" TEXT NOT NULL,
    "newUsername" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsernameChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsernameBlacklist_pattern_key" ON "UsernameBlacklist"("pattern");

-- CreateIndex
CREATE INDEX "UsernameChangeLog_userId_changedAt_idx" ON "UsernameChangeLog"("userId", "changedAt" DESC);

-- AddForeignKey
ALTER TABLE "UsernameBlacklist" ADD CONSTRAINT "UsernameBlacklist_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsernameChangeLog" ADD CONSTRAINT "UsernameChangeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
