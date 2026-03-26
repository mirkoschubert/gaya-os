-- CreateEnum
CREATE TYPE "PostEntityType" AS ENUM ('CITY', 'COUNCIL', 'USER');

-- AlterEnum
ALTER TYPE "ChannelType" ADD VALUE 'CITY_PUBLIC';

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "cityId" TEXT;

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "entityType" "PostEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "mediaUrls" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_entityType_entityId_createdAt_idx" ON "Post"("entityType", "entityId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Channel_cityId_idx" ON "Channel"("cityId");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
