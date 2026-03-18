import { prisma } from '$lib/server/prisma'
import { logAction } from './audit'
import { getAllSettings } from './settings'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type UsernameCheckReason = 'taken' | 'blacklisted' | null

export interface UsernameCheckResult {
  available: boolean
  reason: UsernameCheckReason
  /** Human-readable reason from the blacklist entry, if blacklisted */
  blacklistReason?: string
}

export interface CooldownStatus {
  onCooldown: boolean
  availableAt: Date | null
}

// ──────────────────────────────────────────────
// Public service functions
// ──────────────────────────────────────────────

/**
 * Check if a username is already taken by another user.
 * Pass excludeUserId to ignore the current user (for profile updates).
 */
export async function isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean> {
  const where = excludeUserId
    ? { username, id: { not: excludeUserId } }
    : { username }
  const existing = await prisma.user.findFirst({ where, select: { id: true } })
  return existing !== null
}

/**
 * Check if a username matches any pattern in the UsernameBlacklist.
 * Patterns are matched case-insensitively as exact strings or full regex patterns.
 * Returns the matching entry (with reason) or null if no match.
 */
export async function isUsernameBlacklisted(
  username: string
): Promise<{ matched: true; reason: string } | { matched: false }> {
  const blacklist = await prisma.usernameBlacklist.findMany({
    select: { pattern: true, reason: true }
  })
  const lower = username.toLowerCase()

  for (const entry of blacklist) {
    try {
      const regex = new RegExp(entry.pattern, 'i')
      if (regex.test(lower)) return { matched: true, reason: entry.reason ?? 'Not allowed' }
    } catch {
      if (lower === entry.pattern.toLowerCase())
        return { matched: true, reason: entry.reason ?? 'Not allowed' }
    }
  }
  return { matched: false }
}

/**
 * Perform both availability checks and return a combined result.
 * This is what the API endpoint uses.
 */
export async function checkUsernameAvailability(
  username: string,
  excludeUserId?: string
): Promise<UsernameCheckResult> {
  const blacklistResult = await isUsernameBlacklisted(username)
  if (blacklistResult.matched) {
    return { available: false, reason: 'blacklisted', blacklistReason: blacklistResult.reason }
  }
  if (await isUsernameTaken(username, excludeUserId)) {
    return { available: false, reason: 'taken' }
  }
  return { available: true, reason: null }
}

/**
 * Check if the user is within the change cooldown period.
 * Returns whether they are on cooldown and when they can next change.
 */
export async function isUsernameOnCooldown(userId: string): Promise<CooldownStatus> {
  const settings = await getAllSettings()
  const cooldownDays = settings.username.changeCooldownDays

  if (cooldownDays <= 0) return { onCooldown: false, availableAt: null }

  const lastChange = await prisma.usernameChangeLog.findFirst({
    where: { userId },
    orderBy: { changedAt: 'desc' },
    select: { changedAt: true }
  })

  if (!lastChange) return { onCooldown: false, availableAt: null }

  const availableAt = new Date(lastChange.changedAt.getTime() + cooldownDays * 24 * 60 * 60 * 1000)
  if (availableAt > new Date()) {
    return { onCooldown: true, availableAt }
  }
  return { onCooldown: false, availableAt: null }
}

/**
 * Change a user's username.
 * Validates cooldown, blacklist, and availability before making the change.
 * Logs the change to audit log and username change history.
 *
 * Throws a descriptive error if any check fails.
 */
export async function changeUsername(
  userId: string,
  newUsername: string,
  currentUsername: string
): Promise<void> {
  // 1. Cooldown check
  const cooldown = await isUsernameOnCooldown(userId)
  if (cooldown.onCooldown && cooldown.availableAt) {
    const date = cooldown.availableAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    throw new Error(`Username can be changed again on ${date}.`)
  }

  // 2. Blacklist check
  const blacklistResult = await isUsernameBlacklisted(newUsername)
  if (blacklistResult.matched) {
    throw new Error(`This username is not allowed: ${blacklistResult.reason}`)
  }

  // 3. Availability check (excluding current user)
  if (await isUsernameTaken(newUsername, userId)) {
    throw new Error('This username is already taken.')
  }

  // 4. Apply the change
  await prisma.user.update({
    where: { id: userId },
    data: { username: newUsername, displayUsername: newUsername }
  })

  // 5. Record in change log
  await prisma.usernameChangeLog.create({
    data: { userId, oldUsername: currentUsername, newUsername }
  })

  // 6. Audit log
  await logAction({
    userId,
    action: 'USERNAME_CHANGED',
    entityType: 'USER',
    entityId: userId,
    metadata: { oldUsername: currentUsername, newUsername }
  })
}
