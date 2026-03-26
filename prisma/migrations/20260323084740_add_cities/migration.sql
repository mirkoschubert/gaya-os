/*
  Warnings:

  - A unique constraint covering the columns `[cityId]` on the table `Council` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CitizenshipApplication" ADD COLUMN     "cityId" TEXT;

-- AlterTable
ALTER TABLE "Council" ADD COLUMN     "cityId" TEXT;

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "banner" TEXT,
    "foundedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "unitId" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityMembership" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CityMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "City_unitId_key" ON "City"("unitId");

-- CreateIndex
CREATE INDEX "City_active_idx" ON "City"("active");

-- CreateIndex
CREATE INDEX "CityMembership_cityId_idx" ON "CityMembership"("cityId");

-- CreateIndex
CREATE INDEX "CityMembership_userId_idx" ON "CityMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CityMembership_cityId_userId_key" ON "CityMembership"("cityId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Council_cityId_key" ON "Council"("cityId");

-- AddForeignKey
ALTER TABLE "Council" ADD CONSTRAINT "Council_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CityMembership" ADD CONSTRAINT "CityMembership_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CityMembership" ADD CONSTRAINT "CityMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenshipApplication" ADD CONSTRAINT "CitizenshipApplication_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
