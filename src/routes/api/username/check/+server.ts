import { error, json } from '@sveltejs/kit'
import { checkUsernameAvailability } from '$lib/server/services/username'
import type { RequestHandler } from './$types'

// Minimum username length (matches better-auth username plugin default)
const MIN_LENGTH = 3
const MAX_LENGTH = 30
// Only letters, numbers, underscores and dots
const VALID_PATTERN = /^[a-zA-Z0-9_.]+$/

/**
 * GET /api/username/check?username=foo[&excludeUserId=xxx]
 *
 * Returns availability status for a username.
 * No authentication required (needed for registration before login).
 * No sensitive data is exposed — only a boolean + reason string.
 */
export const GET: RequestHandler = async ({ url }) => {
  const username = url.searchParams.get('username')
  const excludeUserId = url.searchParams.get('excludeUserId') ?? undefined

  if (!username) error(400, 'Missing username parameter')

  // Basic format validation — return invalid immediately without DB hit
  if (username.length < MIN_LENGTH || username.length > MAX_LENGTH) {
    return json({ available: false, reason: 'invalid' })
  }
  if (!VALID_PATTERN.test(username)) {
    return json({ available: false, reason: 'invalid' })
  }

  const result = await checkUsernameAvailability(username, excludeUserId)
  return json({
    available: result.available,
    reason: result.reason,
    blacklistReason: result.blacklistReason ?? null
  })
}
