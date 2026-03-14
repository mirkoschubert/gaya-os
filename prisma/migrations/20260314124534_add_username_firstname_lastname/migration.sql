-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "username" TEXT,
    "displayUsername" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "civicStatus" TEXT NOT NULL DEFAULT 'VISITOR',
    "citizenId" TEXT,
    "joinedAt" DATETIME
);
INSERT INTO "new_user" ("citizenId", "civicStatus", "createdAt", "email", "emailVerified", "id", "image", "joinedAt", "name", "role", "updatedAt") SELECT "citizenId", "civicStatus", "createdAt", "email", "emailVerified", "id", "image", "joinedAt", "name", "role", "updatedAt" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
CREATE UNIQUE INDEX "user_citizenId_key" ON "user"("citizenId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
