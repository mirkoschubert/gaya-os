import { prisma } from '$lib/server/prisma'
import { logAction } from './audit'
import { getAllSettings } from './settings'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface RequestContext {
  ipAddress: string | null
  userAgent: string | null
  fingerprintId?: string | null
  geoCountry?: string | null
}

export interface ApplicationData {
  firstName: string
  middleNames?: string
  lastName: string
  country: string
  city: string
  motivationText: string
}

export type FlagCode =
  | 'IP_MULTIPLE_APPS_SAME_IP'
  | 'FP_MULTIPLE_APPS_SAME_FINGERPRINT'
  | 'DISPOSABLE_EMAIL_DOMAIN'
  | 'GEO_COUNTRY_MISMATCH'
  | 'MANUAL_DEBUG_OVERRIDE'
  | 'SUSPICIOUS_PATTERN'
  | 'CITIZENSHIP_REVOKED'

export interface ApplicationFlag {
  code: FlagCode
  detail?: string
}

export interface ApplicationView {
  id: string
  userId: string
  firstName: string
  middleNames: string | null
  lastName: string
  country: string
  city: string | null
  motivationText: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  flags: ApplicationFlag[]
  ipAddress: string | null
  userAgent: string | null
  fingerprintId: string | null
  geoCountry: string | null
  reviewerId: string | null
  reviewedAt: Date | null
  reviewComment: string | null
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    email: string
    name: string
    username: string | null
    createdAt: Date
  }
}

// ──────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────

/**
 * Debug mode: relaxed throttling for testing.
 * NEVER active in production, regardless of env var.
 */
export function isDebugMode(): boolean {
  if (process.env.NODE_ENV === 'production') return false
  return process.env.CITIZENSHIP_DEBUG === 'true'
}

const CITIZEN_ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

async function generateCitizenId(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const rand = Array.from(
      { length: 12 },
      () => CITIZEN_ID_CHARS[Math.floor(Math.random() * CITIZEN_ID_CHARS.length)]
    ).join('')
    const id = `CX-${rand}`
    const existing = await prisma.user.findUnique({ where: { citizenId: id } })
    if (!existing) return id
  }
  throw new Error('Failed to generate unique citizen ID after 10 attempts.')
}

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  'throwam.com',
  'yopmail.com',
  'sharklasers.com',
  'trashmail.com',
  'trashmail.at',
  'trashmail.me',
  'spam4.me',
  'fakeinbox.com',
  'maildrop.cc',
  'dispostable.com',
  'getairmail.com'
])

async function runCitizenshipHeuristics(
  data: ApplicationData,
  context: RequestContext,
  userEmail: string,
  excludeUserId: string,
  ipWindowDays: number
): Promise<ApplicationFlag[]> {
  const flags: ApplicationFlag[] = []

  // 1. Disposable email domain
  const emailDomain = userEmail.split('@')[1]?.toLowerCase()
  if (emailDomain && DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
    flags.push({
      code: 'DISPOSABLE_EMAIL_DOMAIN',
      detail: `Email domain "${emailDomain}" is a known disposable provider.`
    })
  }

  // 2. Multiple applications from the same IP
  if (!isDebugMode() && context.ipAddress) {
    const windowStart = new Date(Date.now() - ipWindowDays * 24 * 60 * 60 * 1000)
    const count = await prisma.citizenshipApplication.count({
      where: {
        ipAddress: context.ipAddress,
        createdAt: { gte: windowStart },
        userId: { not: excludeUserId }
      }
    })
    if (count >= 1) {
      flags.push({
        code: 'IP_MULTIPLE_APPS_SAME_IP',
        detail: `${count} other application(s) from this IP in the last ${ipWindowDays} days.`
      })
    }
  }

  // 3. Multiple applications from the same fingerprint
  if (!isDebugMode() && context.fingerprintId) {
    const windowStart = new Date(Date.now() - ipWindowDays * 24 * 60 * 60 * 1000)
    const count = await prisma.citizenshipApplication.count({
      where: {
        fingerprintId: context.fingerprintId,
        createdAt: { gte: windowStart },
        userId: { not: excludeUserId }
      }
    })
    if (count >= 1) {
      flags.push({
        code: 'FP_MULTIPLE_APPS_SAME_FINGERPRINT',
        detail: `${count} other application(s) from the same device fingerprint in the last ${ipWindowDays} days.`
      })
    }
  }

  // 4. Geographic country mismatch (stub — requires IP geolocation service)
  // TODO: implement IP geolocation lookup and compare context.geoCountry vs data.country
  if (context.geoCountry && context.geoCountry !== data.country) {
    flags.push({
      code: 'GEO_COUNTRY_MISMATCH',
      detail: `Declared country "${data.country}" differs from IP-derived country "${context.geoCountry}".`
    })
  }

  // 5. Debug mode marker
  if (isDebugMode()) {
    flags.push({
      code: 'MANUAL_DEBUG_OVERRIDE',
      detail: 'Application submitted in debug mode. Throttling and age checks are disabled.'
    })
  }

  return flags
}

function mapApplicationView(
  app: {
    id: string
    userId: string
    firstName: string
    middleNames: string | null
    lastName: string
    country: string
    city: string | null
    motivationText: string
    status: string
    flags: unknown
    ipAddress: string | null
    userAgent: string | null
    fingerprintId: string | null
    geoCountry: string | null
    reviewerId: string | null
    reviewedAt: Date | null
    reviewComment: string | null
    createdAt: Date
    updatedAt: Date
    user?: {
      id: string
      email: string
      name: string
      username: string | null
      createdAt: Date
    } | null
  }
): ApplicationView {
  return {
    ...app,
    status: app.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    flags: (app.flags as ApplicationFlag[] | null) ?? [],
    user: app.user ?? undefined
  }
}

// ──────────────────────────────────────────────
// Public service functions
// ──────────────────────────────────────────────

/**
 * Submit a citizenship application.
 * Runs heuristics and stores the application as PENDING.
 * Resubmission is allowed after a previous REJECTED application (upsert).
 */
export async function submitCitizenshipApplication(
  userId: string,
  data: ApplicationData,
  context: RequestContext
): Promise<{ applicationId: string; flags: ApplicationFlag[] }> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { civicStatus: true, email: true, createdAt: true, firstName: true, lastName: true }
  })

  if (user.civicStatus !== 'VISITOR') {
    throw new Error('You are already a citizen or not eligible to apply.')
  }

  const existing = await prisma.citizenshipApplication.findUnique({ where: { userId } })
  if (existing) {
    if (existing.status === 'PENDING') {
      throw new Error('You already have a pending citizenship application.')
    }
    if (existing.status === 'APPROVED') {
      throw new Error('Your citizenship application has already been approved.')
    }
    // REJECTED: allow resubmission via upsert below
  }

  // Account age check (production only, configurable)
  if (!isDebugMode()) {
    const settings = await getAllSettings()
    if (settings.citizenship.minAccountAgeDays > 0) {
      const ageMs = Date.now() - user.createdAt.getTime()
      const ageDays = ageMs / (1000 * 60 * 60 * 24)
      if (ageDays < settings.citizenship.minAccountAgeDays) {
        throw new Error(
          `Your account must be at least ${settings.citizenship.minAccountAgeDays} day(s) old to apply.`
        )
      }
    }
  }

  const settings = await getAllSettings()
  const flags = await runCitizenshipHeuristics(
    data,
    context,
    user.email,
    userId,
    settings.citizenship.ipWindowDays
  )

  const application = await prisma.citizenshipApplication.upsert({
    where: { userId },
    update: {
      firstName: data.firstName,
      middleNames: data.middleNames ?? null,
      lastName: data.lastName,
      country: data.country,
      city: data.city,
      motivationText: data.motivationText,
      status: 'PENDING',
      flags: flags as object[],
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      fingerprintId: context.fingerprintId ?? null,
      geoCountry: context.geoCountry ?? null,
      reviewerId: null,
      reviewedAt: null,
      reviewComment: null
    },
    create: {
      userId,
      firstName: data.firstName,
      middleNames: data.middleNames ?? null,
      lastName: data.lastName,
      country: data.country,
      city: data.city,
      motivationText: data.motivationText,
      status: 'PENDING',
      flags: flags as object[],
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      fingerprintId: context.fingerprintId ?? null,
      geoCountry: context.geoCountry ?? null
    }
  })

  // Create UserFlag records for flags that warrant persistent user-level tracking
  const persistentFlagCodes: FlagCode[] = [
    'IP_MULTIPLE_APPS_SAME_IP',
    'FP_MULTIPLE_APPS_SAME_FINGERPRINT',
    'DISPOSABLE_EMAIL_DOMAIN'
  ]
  const persistentFlags = flags.filter((f) => persistentFlagCodes.includes(f.code))
  if (persistentFlags.length > 0) {
    await prisma.userFlag.createMany({
      data: persistentFlags.map((f) => ({
        userId,
        code: f.code,
        metadata: { detail: f.detail ?? null, sourceApplicationId: application.id }
      }))
    })
  }

  // Update UserTechnicalProfile: set registrationIp if not yet set
  if (context.ipAddress) {
    const profile = await prisma.userTechnicalProfile.findUnique({ where: { userId } })
    if (!profile?.registrationIp) {
      await prisma.userTechnicalProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          registrationIp: context.ipAddress,
          lastIp: context.ipAddress,
          lastUserAgent: context.userAgent,
          ipHistory: [{ ip: context.ipAddress, seenAt: new Date().toISOString() }]
        }
      })
    }
  }

  await logAction({
    userId,
    action: 'CITIZENSHIP_APPLIED',
    entityType: 'CITIZENSHIP_APPLICATION',
    entityId: application.id,
    metadata: {
      flagCount: flags.length,
      hasDebugFlag: flags.some((f) => f.code === 'MANUAL_DEBUG_OVERRIDE')
    }
  })

  return { applicationId: application.id, flags }
}

/**
 * Approve a citizenship application.
 * Sets the user's civicStatus to CITIZEN and generates a citizenId.
 * Also copies firstName/lastName from the application to the user profile if not set.
 */
export async function approveCitizenshipApplication(
  applicationId: string,
  reviewerId: string,
  comment?: string
): Promise<void> {
  const application = await prisma.citizenshipApplication.findUniqueOrThrow({
    where: { id: applicationId },
    include: { user: { select: { id: true, firstName: true, lastName: true } } }
  })

  if (application.status !== 'PENDING') {
    throw new Error(`Application is not in PENDING status (current: ${application.status}).`)
  }

  const citizenId = await generateCitizenId()
  const now = new Date()

  await prisma.$transaction([
    prisma.citizenshipApplication.update({
      where: { id: applicationId },
      data: { status: 'APPROVED', reviewerId, reviewedAt: now, reviewComment: comment ?? null }
    }),
    prisma.user.update({
      where: { id: application.userId },
      data: {
        civicStatus: 'CITIZEN',
        citizenId,
        joinedAt: now,
        // Copy name from application if not already set on profile
        firstName: application.user.firstName || application.firstName,
        lastName: application.user.lastName || application.lastName
      }
    })
  ])

  await logAction({
    userId: application.userId,
    action: 'CITIZENSHIP_GRANTED',
    entityType: 'USER',
    entityId: application.userId,
    metadata: { citizenId, reviewerId, applicationId, grantedAt: now.toISOString() }
  })
}

/**
 * Reject a citizenship application.
 * The applicant remains a VISITOR and may resubmit.
 */
export async function rejectCitizenshipApplication(
  applicationId: string,
  reviewerId: string,
  comment: string
): Promise<void> {
  const application = await prisma.citizenshipApplication.findUniqueOrThrow({
    where: { id: applicationId }
  })

  if (application.status !== 'PENDING') {
    throw new Error(`Application is not in PENDING status (current: ${application.status}).`)
  }

  await prisma.citizenshipApplication.update({
    where: { id: applicationId },
    data: {
      status: 'REJECTED',
      reviewerId,
      reviewedAt: new Date(),
      reviewComment: comment
    }
  })

  await logAction({
    userId: application.userId,
    action: 'CITIZENSHIP_REJECTED',
    entityType: 'CITIZENSHIP_APPLICATION',
    entityId: applicationId,
    metadata: { reviewerId, comment }
  })
}

/**
 * Get the current citizenship application for a user (if any).
 */
export async function getApplicationByUserId(userId: string): Promise<ApplicationView | null> {
  const app = await prisma.citizenshipApplication.findUnique({ where: { userId } })
  if (!app) return null
  return mapApplicationView(app)
}

/**
 * List all PENDING applications for admin review, ordered by submission date (oldest first).
 */
export async function listPendingApplications(): Promise<ApplicationView[]> {
  const apps = await prisma.citizenshipApplication.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, email: true, name: true, username: true, createdAt: true } }
    }
  })
  return apps.map(mapApplicationView)
}

/**
 * List all applications (all statuses) for admin review.
 */
export async function listAllApplications(): Promise<ApplicationView[]> {
  const apps = await prisma.citizenshipApplication.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, email: true, name: true, username: true, createdAt: true } }
    }
  })
  return apps.map(mapApplicationView)
}

/**
 * Revoke citizenship from a user.
 * Sets civicStatus back to VISITOR, keeps citizenId for audit trail,
 * marks the application as REJECTED, adds a CITIZENSHIP_REVOKED UserFlag,
 * and writes an audit log entry.
 *
 * Used by future law-based sanction workflows.
 */
export async function revokeCitizenship(
  userId: string,
  reason: string,
  revokedById: string
): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { civicStatus: true }
  })

  if (user.civicStatus !== 'CITIZEN') {
    throw new Error('User is not a citizen.')
  }

  const now = new Date()

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { civicStatus: 'VISITOR', joinedAt: null }
    }),
    prisma.citizenshipApplication.updateMany({
      where: { userId, status: 'APPROVED' },
      data: { status: 'REJECTED', reviewerId: revokedById, reviewedAt: now, reviewComment: reason }
    })
  ])

  await prisma.userFlag.create({
    data: {
      userId,
      code: 'CITIZENSHIP_REVOKED',
      metadata: { reason, revokedById, revokedAt: now.toISOString() }
    }
  })

  await logAction({
    userId,
    action: 'CITIZENSHIP_REVOKED',
    entityType: 'USER',
    entityId: userId,
    metadata: { reason, revokedById, revokedAt: now.toISOString() }
  })
}

/**
 * Self-initiated citizenship cancellation (by the user themselves).
 * Reverts civicStatus to VISITOR, keeps citizenId and all content for
 * transparency. Council members must wait out the grace period first —
 * this function does NOT check that; the caller is responsible.
 */
export async function cancelCitizenship(userId: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { civicStatus: true }
  })

  if (user.civicStatus !== 'CITIZEN') {
    throw new Error('User is not a citizen.')
  }

  const now = new Date()

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { civicStatus: 'VISITOR', joinedAt: null }
    }),
    prisma.citizenshipApplication.updateMany({
      where: { userId, status: 'APPROVED' },
      data: {
        status: 'REJECTED',
        reviewedAt: now,
        reviewComment: 'Citizenship cancelled by user.'
      }
    })
  ])

  await logAction({
    userId,
    action: 'CITIZENSHIP_REVOKED',
    entityType: 'USER',
    entityId: userId,
    metadata: { reason: 'Self-initiated cancellation', revokedAt: now.toISOString() }
  })
}

// ──────────────────────────────────────────────
// Migration utility (unchanged from original)
// ──────────────────────────────────────────────

const OLD_ID_PATTERN = /^CX-(\d{4}-\d{4}|ADMIN-.+)$/

/**
 * Migrates all citizen IDs that match the old format (CX-YYYY-NNNN or CX-ADMIN-...)
 * to the new random format (CX-ZZZZZZZZZZZZ).
 * Safe to run multiple times — skips already-migrated IDs.
 * Returns the number of IDs migrated.
 */
export async function migrateOldCitizenIds(): Promise<number> {
  const users = await prisma.user.findMany({
    where: { citizenId: { not: null } },
    select: { id: true, citizenId: true }
  })

  const toMigrate = users.filter((u) => u.citizenId && OLD_ID_PATTERN.test(u.citizenId))
  if (toMigrate.length === 0) return 0

  for (const user of toMigrate) {
    const newId = await generateCitizenId()
    await prisma.user.update({ where: { id: user.id }, data: { citizenId: newId } })
    await logAction({
      userId: user.id,
      action: 'CITIZEN_ID_MIGRATED',
      entityType: 'USER',
      entityId: user.id,
      metadata: { oldId: user.citizenId, newId }
    })
  }

  return toMigrate.length
}
