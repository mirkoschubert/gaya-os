import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { DATABASE_URL } from '$env/static/private'

function createPrismaClient() {
  // DATABASE_URL for SQLite is "file:./path/to/db.db" – strip the "file:" prefix
  const url = DATABASE_URL.replace(/^file:/, '') as ':memory:' | (string & {})
  const adapter = new PrismaBetterSqlite3({ url })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
