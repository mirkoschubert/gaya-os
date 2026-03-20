// Pure domain types and constants for the Activity Log.
// No Prisma, no HTTP — safe to import anywhere including client-side code.

export type AuditAction =
  | 'USER_REGISTERED'
  | 'USER_LOGGED_IN'
  | 'USER_LOGGED_OUT'
  | 'CITIZENSHIP_APPLIED'
  | 'CITIZENSHIP_GRANTED'
  | 'CITIZENSHIP_REJECTED'
  | 'CITIZENSHIP_REVOKED'
  | 'USER_DELETED'
  | 'USER_FLAGGED'
  | 'USERNAME_CHANGED'
  | 'PROPOSAL_CREATED'
  | 'PROPOSAL_SUPPORT_ADDED'
  | 'COMMENT_CREATED'
  | 'VOTE_CAST'
  | 'DELEGATION_CREATED'
  | 'DOCUMENT_VERSION_CREATED'
  | 'DOCUMENT_DELETED'
  | 'ROLE_CHANGED'
  | 'EMAIL_VERIFIED'
  | 'COUNCIL_DECISION'
  | 'COUNCIL_MEMBER_ADDED'
  | 'COUNCIL_MEMBER_REMOVED'
  | 'COUNCIL_SESSION_CREATED'
  | 'COUNCIL_INTERNAL_VOTE_CAST'
  | 'COUNCIL_NOMINATION_SUBMITTED'
  | 'PROPOSAL_REVIEWED_BY_COUNCIL'
  | 'PROPOSAL_STATUS_CHANGED'
  | 'SYSTEM_SETTING_UPDATED'
  | 'ROLE_CAPABILITY_UPDATED'
  | 'CITIZEN_ID_MIGRATED'

// A log sentence is a list of segments — rendered inline.
export type LogSegment =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string }
  | { type: 'link'; value: string; href: string }
  | { type: 'code-link'; value: string; href: string }

export const ACTION_OPTIONS: { value: AuditAction | ''; label: string }[] = [
  { value: '', label: 'All actions' },
  { value: 'USER_REGISTERED', label: 'Registered' },
  { value: 'USER_LOGGED_IN', label: 'Logged in' },
  { value: 'USER_LOGGED_OUT', label: 'Logged out' },
  { value: 'CITIZENSHIP_APPLIED', label: 'Citizenship applied' },
  { value: 'CITIZENSHIP_GRANTED', label: 'Citizenship granted' },
  { value: 'CITIZENSHIP_REJECTED', label: 'Citizenship rejected' },
  { value: 'CITIZENSHIP_REVOKED', label: 'Citizenship revoked' },
  { value: 'USERNAME_CHANGED', label: 'Username changed' },
  { value: 'PROPOSAL_CREATED', label: 'Proposal created' },
  { value: 'COMMENT_CREATED', label: 'Comment created' },
  { value: 'VOTE_CAST', label: 'Vote cast' },
  { value: 'DOCUMENT_VERSION_CREATED', label: 'Document version published' },
  { value: 'ROLE_CHANGED', label: 'Role changed' },
  { value: 'COUNCIL_MEMBER_ADDED', label: 'Council member added' },
  { value: 'COUNCIL_MEMBER_REMOVED', label: 'Council member removed' },
  { value: 'COUNCIL_SESSION_CREATED', label: 'Council session created' },
  { value: 'COUNCIL_INTERNAL_VOTE_CAST', label: 'Council vote cast' },
  { value: 'COUNCIL_NOMINATION_SUBMITTED', label: 'Council nomination submitted' },
  { value: 'PROPOSAL_REVIEWED_BY_COUNCIL', label: 'Proposal reviewed by council' },
  { value: 'SYSTEM_SETTING_UPDATED', label: 'Setting changed' },
  { value: 'ROLE_CAPABILITY_UPDATED', label: 'Permission changed' }
]

export interface ActivityUser {
  id: string
  name: string
  civicStatus: string
  role: string
  username: string | null
}

export interface ActivityEntry {
  id: string
  action: AuditAction
  entityType: string | null
  entityId: string | null
  metadata: unknown
  createdAt: Date
  user: ActivityUser | null
}

export interface ActivityPage {
  entries: ActivityEntry[]
  nextCursor: string | null
  prevCursor: string | null
}

export function displayHandle(user: ActivityUser): string {
  return user.username ? `@${user.username}` : user.name
}

export function formatRoles(user: ActivityUser): string {
  const parts: string[] = [user.civicStatus]
  if (user.role !== 'USER') parts.push(user.role)
  return parts.join(', ')
}

/**
 * Builds a log sentence as an array of typed segments.
 * The actor (@username) is NOT included — callers render it separately.
 */
export function buildLogSentence(entry: ActivityEntry): LogSegment[] {
  const m = entry.metadata as Record<string, string> | null | undefined

  switch (entry.action) {
    case 'USER_REGISTERED':
      return [{ type: 'text', value: 'registered an account' }]

    case 'USER_LOGGED_IN':
      return [{ type: 'text', value: 'logged in' }]

    case 'USER_LOGGED_OUT':
      return [{ type: 'text', value: 'logged out' }]

    case 'EMAIL_VERIFIED':
      return [{ type: 'text', value: 'verified their email address' }]

    case 'CITIZENSHIP_APPLIED':
      return [{ type: 'text', value: 'submitted a citizenship application' }]

    case 'CITIZENSHIP_GRANTED':
      return [
        { type: 'text', value: 'was granted citizenship — ID ' },
        { type: 'code', value: m?.citizenId ?? '?' }
      ]

    case 'CITIZENSHIP_REJECTED': {
      const segments: LogSegment[] = [{ type: 'text', value: 'citizenship application was rejected' }]
      if (m?.comment) {
        segments.push({ type: 'text', value: ' — ' })
        segments.push({ type: 'code', value: m.comment })
      }
      return segments
    }

    case 'USER_DELETED':
      return [{ type: 'text', value: 'deleted their account' }]

    case 'CITIZENSHIP_REVOKED': {
      const segments: LogSegment[] = [{ type: 'text', value: 'citizenship was revoked' }]
      if (m?.reason) {
        segments.push({ type: 'text', value: ' — ' })
        segments.push({ type: 'code', value: m.reason })
      }
      return segments
    }

    case 'USERNAME_CHANGED':
      return [
        { type: 'text', value: 'changed username from ' },
        { type: 'code', value: m?.oldUsername ?? '?' },
        { type: 'text', value: ' to ' },
        { type: 'code', value: m?.newUsername ?? '?' }
      ]

    case 'USER_FLAGGED':
      return [
        { type: 'text', value: 'was flagged: ' },
        { type: 'code', value: m?.code ?? '?' }
      ]

    case 'CITIZEN_ID_MIGRATED':
      return [
        { type: 'text', value: 'citizen ID migrated to ' },
        { type: 'code', value: m?.newId ?? '?' }
      ]

    case 'ROLE_CHANGED':
      return [
        { type: 'text', value: 'role changed to ' },
        { type: 'code', value: m?.newRole ?? '?' }
      ]

    case 'PROPOSAL_CREATED': {
      const title = m?.title ?? 'Untitled'
      const href = entry.entityId ? `/proposals/${entry.entityId}` : null
      return href
        ? [{ type: 'text', value: 'created proposal ' }, { type: 'code-link', value: title, href }]
        : [{ type: 'text', value: 'created proposal ' }, { type: 'code', value: title }]
    }

    case 'PROPOSAL_SUPPORT_ADDED': {
      const title = m?.title ?? 'a proposal'
      const href = entry.entityId ? `/proposals/${entry.entityId}` : null
      return href
        ? [{ type: 'text', value: 'supported proposal ' }, { type: 'code-link', value: title, href }]
        : [{ type: 'text', value: 'supported proposal ' }, { type: 'code', value: title }]
    }

    case 'COMMENT_CREATED': {
      const title = m?.proposalTitle ?? 'a proposal'
      const href = m?.proposalId ? `/proposals/${m.proposalId}` : null
      return href
        ? [{ type: 'text', value: 'commented on ' }, { type: 'code-link', value: title, href }]
        : [{ type: 'text', value: 'commented on ' }, { type: 'code', value: title }]
    }

    case 'VOTE_CAST': {
      const title = m?.proposalTitle ?? 'a vote session'
      const href = m?.voteSessionId ? `/votes/${m.voteSessionId}` : null
      const choice = m?.choice ? ` (${m.choice})` : ''
      return href
        ? [{ type: 'text', value: `cast a vote${choice} on ` }, { type: 'code-link', value: title, href }]
        : [{ type: 'text', value: `cast a vote${choice} on ` }, { type: 'code', value: title }]
    }

    case 'DELEGATION_CREATED': {
      const category = m?.category ?? 'GLOBAL'
      const delegateName = m?.delegateName ?? '?'
      return [
        { type: 'text', value: 'set up a ' },
        { type: 'code', value: category },
        { type: 'text', value: ' delegation to ' },
        { type: 'code', value: delegateName }
      ]
    }

    case 'DOCUMENT_VERSION_CREATED': {
      const docTitle = m?.documentTitle ?? m?.documentSlug ?? 'a document'
      const versionLabel = m?.versionLabel ?? null
      const docSlug = m?.documentSlug
      const docHref = docSlug ? `/documents/${docSlug}` : null
      const diffHref = docSlug && versionLabel ? `/documents/${docSlug}/history` : null
      const segments: LogSegment[] = [{ type: 'text', value: 'published ' }]
      if (versionLabel && diffHref) {
        segments.push({ type: 'code-link', value: versionLabel, href: diffHref })
      } else if (versionLabel) {
        segments.push({ type: 'code', value: versionLabel })
      } else {
        segments.push({ type: 'text', value: 'a new version' })
      }
      segments.push({ type: 'text', value: ' of ' })
      if (docHref) {
        segments.push({ type: 'link', value: docTitle, href: docHref })
      } else {
        segments.push({ type: 'text', value: docTitle })
      }
      return segments
    }

    case 'DOCUMENT_DELETED': {
      const title = m?.title ?? 'a document'
      return [{ type: 'text', value: 'deleted document ' }, { type: 'code', value: title }]
    }

    case 'COUNCIL_DECISION': {
      const subject = m?.subject ?? 'a matter'
      const outcome = m?.outcome ? ` - ${m.outcome}` : ''
      return [{ type: 'text', value: `made a council decision on ${subject}${outcome}` }]
    }

    case 'COUNCIL_MEMBER_ADDED': {
      const councilName = m?.councilName ?? 'a council'
      const memberName = m?.memberName ?? '?'
      return [
        { type: 'text', value: `added ` },
        { type: 'code', value: memberName },
        { type: 'text', value: ` to council ` },
        { type: 'code', value: councilName }
      ]
    }

    case 'COUNCIL_MEMBER_REMOVED': {
      const councilName = m?.councilName ?? 'a council'
      const memberName = m?.memberName ?? '?'
      return [
        { type: 'text', value: `removed ` },
        { type: 'code', value: memberName },
        { type: 'text', value: ` from council ` },
        { type: 'code', value: councilName }
      ]
    }

    case 'COUNCIL_SESSION_CREATED': {
      const title = m?.sessionTitle ?? 'a session'
      const councilName = m?.councilName ?? 'a council'
      return [
        { type: 'text', value: 'created session ' },
        { type: 'code', value: title },
        { type: 'text', value: ' for council ' },
        { type: 'code', value: councilName }
      ]
    }

    case 'COUNCIL_INTERNAL_VOTE_CAST': {
      const title = m?.voteTitle ?? 'an internal vote'
      const councilName = m?.councilName ?? 'a council'
      return [
        { type: 'text', value: 'cast a vote on ' },
        { type: 'code', value: title },
        { type: 'text', value: ' in council ' },
        { type: 'code', value: councilName }
      ]
    }

    case 'COUNCIL_NOMINATION_SUBMITTED': {
      const councilName = m?.councilName ?? 'a council'
      const isSelf = m?.nominatedById === null || m?.nominatedById === undefined
      return isSelf
        ? [{ type: 'text', value: 'submitted a self-nomination for council ' }, { type: 'code', value: councilName }]
        : [{ type: 'text', value: 'submitted a nomination for council ' }, { type: 'code', value: councilName }]
    }

    case 'PROPOSAL_REVIEWED_BY_COUNCIL': {
      const title = m?.proposalTitle ?? 'a proposal'
      const decision = m?.decision ?? 'reviewed'
      const href = entry.entityId ? `/proposals/${entry.entityId}` : null
      return href
        ? [{ type: 'text', value: `${decision} proposal ` }, { type: 'code-link', value: title, href }]
        : [{ type: 'text', value: `${decision} proposal ` }, { type: 'code', value: title }]
    }

    case 'PROPOSAL_STATUS_CHANGED': {
      const title = m?.proposalTitle ?? 'a proposal'
      const newStatus = m?.newStatus ?? '?'
      const href = entry.entityId ? `/proposals/${entry.entityId}` : null
      return href
        ? [{ type: 'text', value: 'changed status of ' }, { type: 'code-link', value: title, href }, { type: 'text', value: ' to ' }, { type: 'code', value: newStatus }]
        : [{ type: 'text', value: 'changed status of ' }, { type: 'code', value: title }, { type: 'text', value: ' to ' }, { type: 'code', value: newStatus }]
    }

    case 'SYSTEM_SETTING_UPDATED': {
      const meta = entry.metadata as Record<string, unknown> | null | undefined
      const key = (meta?.key as string) ?? '?'
      const oldVal = meta?.oldValue !== undefined ? JSON.stringify(meta.oldValue) : null
      const newVal = meta?.newValue !== undefined ? JSON.stringify(meta.newValue) : '?'
      const segments: LogSegment[] = [
        { type: 'text', value: 'updated setting ' },
        { type: 'code', value: key }
      ]
      if (oldVal !== null) {
        segments.push({ type: 'text', value: ' (was ' })
        segments.push({ type: 'code', value: oldVal })
        segments.push({ type: 'text', value: ')' })
      }
      segments.push({ type: 'text', value: ' to ' })
      segments.push({ type: 'code', value: newVal })
      return segments
    }

    case 'ROLE_CAPABILITY_UPDATED': {
      const meta = entry.metadata as Record<string, unknown> | null | undefined
      const role = (meta?.role as string) ?? '?'
      const capability = (meta?.capability as string) ?? '?'
      const oldValue = meta?.oldValue as boolean | undefined
      const newValue = meta?.newValue as boolean | undefined
      const changed = newValue === true ? 'granted' : 'revoked'
      const segments: LogSegment[] = [
        { type: 'text', value: `${changed} permission ` },
        { type: 'code', value: capability },
        { type: 'text', value: ' for ' },
        { type: 'code', value: role }
      ]
      if (oldValue !== undefined && newValue !== undefined) {
        segments.push({ type: 'text', value: ` (was ${oldValue}, now ${newValue})` })
      }
      return segments
    }

    default:
      return [{ type: 'text', value: (entry.action as string).toLowerCase().replace(/_/g, ' ') }]
  }
}
