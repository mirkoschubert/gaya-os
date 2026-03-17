-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "RoleCapability" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "capability" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RoleCapability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoleCapability_role_idx" ON "RoleCapability"("role");

-- CreateIndex
CREATE UNIQUE INDEX "RoleCapability_role_capability_key" ON "RoleCapability"("role", "capability");

-- AddForeignKey
ALTER TABLE "SystemSetting" ADD CONSTRAINT "SystemSetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
