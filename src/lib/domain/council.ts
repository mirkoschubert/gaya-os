// Pure domain types for the Council system.
// No Prisma, no HTTP - safe to import anywhere including client-side code.

export type CouncilType = 'NATIONAL' | 'REGIONAL' | 'THEMATIC'
export type CouncilSessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type AgendaItemStatus = 'OPEN' | 'IN_DISCUSSION' | 'RESOLVED' | 'DEFERRED'
export type NominationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
export type InternalVoteStatus = 'OPEN' | 'CLOSED'
export type InternalVoteChoice = 'YES' | 'NO' | 'ABSTAIN'

export interface CouncilSummary {
  id: string
  unitId: string
  name: string
  type: CouncilType
  scopeDescription: string | null
  memberCount: number
}

export interface CouncilMember {
  userId: string
  name: string
  username: string | null
  avatarUrl: string | null
  joinedAt: Date
  representativeAreas: string[]
}

export interface CouncilRepresentativeEntry {
  id: string
  userId: string
  name: string
  username: string | null
  area: string
  since: Date
  until: Date | null
}

export interface SessionAgendaItem {
  id: string
  title: string
  description: string | null
  status: AgendaItemStatus
  order: number
  proposalId: string | null
  proposalTitle: string | null
  outcome: string | null
}

export interface CouncilSessionSummary {
  id: string
  councilId: string
  title: string
  description: string | null
  scheduledAt: Date
  endsAt: Date | null
  status: CouncilSessionStatus
  agendaItemCount: number
}

export interface CouncilSessionDetail {
  id: string
  councilId: string
  title: string
  description: string | null
  scheduledAt: Date
  endsAt: Date | null
  status: CouncilSessionStatus
  location: string | null
  notes: string | null
  agendaItems: SessionAgendaItem[]
}

export interface CouncilDetail {
  id: string
  unitId: string
  unitName: string
  name: string
  type: CouncilType
  scopeDescription: string | null
  createdAt: Date
  members: CouncilMember[]
  representatives: CouncilRepresentativeEntry[]
  nextSession: CouncilSessionSummary | null
  openProposalCount: number
}

export interface InternalVoteSummary {
  id: string
  councilId: string
  title: string
  description: string | null
  status: InternalVoteStatus
  endsAt: Date | null
  yesCount: number
  noCount: number
  abstainCount: number
  userChoice: InternalVoteChoice | null
}

export interface CouncilNavEntry {
  councilId: string
  unitName: string
  councilName: string
}
