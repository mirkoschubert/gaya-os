-- AlterTable
ALTER TABLE "user" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "heroUrl" TEXT,
ADD COLUMN     "links" JSONB,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "showRealName" BOOLEAN NOT NULL DEFAULT true;
