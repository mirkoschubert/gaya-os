// Pure domain types and constants for the Activity Log.
// No Prisma, no HTTP — safe to import anywhere including client-side code.

export type AuditAction =
  | 'USER_REGISTERED'
  | 'USER_LOGGED_IN'
  | 'USER_LOGGED_OUT'
  | 'CITIZENSHIP_GRANTED'
  | 'PROPOSAL_CREATED'
  | 'PROPOSAL_SUPPORT_ADDED'
  | 'COMMENT_CREATED'
  | 'VOTE_CAST'
  | 'DELEGATION_CREATED'
  | 'DOCUMENT_VERSION_CREATED'
  | 'ROLE_CHANGED'
  | 'EMAIL_VERIFIED'
  | 'COUNCIL_DECISION'
  | 'SYSTEM_SETTING_UPDATED'

export const ACTION_LABELS: Record<AuditAction, string> = {
  USER_REGISTERED: 'registered',
  USER_LOGGED_IN: 'logged in',
  USER_LOGGED_OUT: 'logged out',
  CITIZENSHIP_GRANTED: 'was granted citizenship',
  PROPOSAL_CREATED: 'created a proposal',
  PROPOSAL_SUPPORT_ADDED: 'supported a proposal',
  COMMENT_CREATED: 'commented on a proposal',
  VOTE_CAST: 'cast a vote',
  DELEGATION_CREATED: 'set up a delegation',
  DOCUMENT_VERSION_CREATED: 'published a document version',
  ROLE_CHANGED: 'had their role changed',
  EMAIL_VERIFIED: 'had their email verified',
  COUNCIL_DECISION: 'made a council decision',
  SYSTEM_SETTING_UPDATED: 'updated a system setting'
}

export const ACTION_OPTIONS: { value: AuditAction | ''; label: string }[] = [
  { value: '', label: 'All actions' },
  { value: 'USER_REGISTERED', label: 'Registered' },
  { value: 'USER_LOGGED_IN', label: 'Logged in' },
  { value: 'USER_LOGGED_OUT', label: 'Logged out' },
  { value: 'CITIZENSHIP_GRANTED', label: 'Citizenship granted' },
  { value: 'PROPOSAL_CREATED', label: 'Proposal created' },
  { value: 'COMMENT_CREATED', label: 'Comment created' },
  { value: 'VOTE_CAST', label: 'Vote cast' },
  { value: 'ROLE_CHANGED', label: 'Role changed' }
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
  nextCursor: string | null  // id of last entry, null = no more pages
  prevCursor: string | null  // id to go back, null = already at start
}

export function displayHandle(user: ActivityUser): string {
  return user.username ? `@${user.username}` : user.name
}

export function entityLink(type: string | null, id: string | null): string | null {
  if (!type || !id) return null
  if (type === 'PROPOSAL') return `/proposals/${id}`
  if (type === 'DOCUMENT') return `/constitution`
  return null
}
