-- Add new versionLabel column
ALTER TABLE "DocumentVersion" ADD COLUMN "versionLabel" TEXT;

-- Backfill: existing integer versions → "0.N.0" format
UPDATE "DocumentVersion" SET "versionLabel" = '0.' || "version"::text || '.0';

-- Make versionLabel NOT NULL
ALTER TABLE "DocumentVersion" ALTER COLUMN "versionLabel" SET NOT NULL;

-- Drop old unique constraint on integer version
DROP INDEX "DocumentVersion_documentId_version_key";

-- Drop old integer version column
ALTER TABLE "DocumentVersion" DROP COLUMN "version";

-- Create new unique constraint on (documentId, versionLabel)
CREATE UNIQUE INDEX "DocumentVersion_documentId_versionLabel_key" ON "DocumentVersion"("documentId", "versionLabel");
