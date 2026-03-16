// Pure domain types and constants for Documents & Versions.
// No Prisma, no HTTP — safe to import anywhere including client-side code.

export type DocumentType = 'CONSTITUTION' | 'POLICY' | 'PROCEDURE'
export type DocumentStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
export type VersionBump = 'major' | 'minor' | 'patch'

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CONSTITUTION: 'Constitution',
  POLICY: 'Policy',
  PROCEDURE: 'Procedure'
}

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  ARCHIVED: 'Archived'
}

export function isValidVersionLabel(label: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(label)
}

export function nextVersionLabel(current: string, bump: VersionBump): string {
  const parts = current.split('.')
  if (parts.length !== 3) throw new Error(`Invalid version label: "${current}"`)
  let [major, minor, patch] = parts.map(Number)
  if (bump === 'major') { major++; minor = 0; patch = 0 }
  else if (bump === 'minor') { minor++; patch = 0 }
  else { patch++ }
  return `${major}.${minor}.${patch}`
}

export interface DocumentVersionAuthor {
  id: string
  name: string
  username: string | null
}

export interface DocumentVersionMeta {
  id: string
  versionLabel: string
  status: DocumentStatus
  changelog: string | null
  createdAt: Date
  createdBy: DocumentVersionAuthor | null
}

export interface DocumentSummary {
  id: string
  title: string
  type: DocumentType
  slug: string
  activeVersion: DocumentVersionMeta | null
  createdAt: Date
}

export interface DocumentDetail extends DocumentSummary {
  activeContent: string | null
}

export interface DocumentVersionDetail extends DocumentVersionMeta {
  documentId: string
  documentSlug: string
  documentTitle: string
  content: string
}
