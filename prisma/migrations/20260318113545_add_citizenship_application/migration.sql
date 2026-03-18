-- CreateEnum
CREATE TYPE "CitizenshipStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "CitizenshipApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleNames" TEXT,
    "lastName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "motivationText" TEXT NOT NULL,
    "status" "CitizenshipStatus" NOT NULL DEFAULT 'PENDING',
    "flags" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "fingerprintId" TEXT,
    "geoCountry" TEXT,
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CitizenshipApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTechnicalProfile" (
    "userId" TEXT NOT NULL,
    "registrationIp" TEXT,
    "lastIp" TEXT,
    "lastUserAgent" TEXT,
    "ipHistory" JSONB,
    "countries" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTechnicalProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserFlag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CitizenshipApplication_userId_key" ON "CitizenshipApplication"("userId");

-- CreateIndex
CREATE INDEX "CitizenshipApplication_status_createdAt_idx" ON "CitizenshipApplication"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CitizenshipApplication_ipAddress_createdAt_idx" ON "CitizenshipApplication"("ipAddress", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserFlag_userId_createdAt_idx" ON "UserFlag"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "CitizenshipApplication" ADD CONSTRAINT "CitizenshipApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenshipApplication" ADD CONSTRAINT "CitizenshipApplication_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTechnicalProfile" ADD CONSTRAINT "UserTechnicalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFlag" ADD CONSTRAINT "UserFlag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
