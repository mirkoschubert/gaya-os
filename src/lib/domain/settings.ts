// Pure domain types and constants for Governance Settings (SystemSetting).
// No Prisma, no HTTP — safe to import anywhere including client-side code.

export type VoteThresholdType = 'unanimous' | 'supermajority' | 'majority'

export interface VoteThreshold {
  type: VoteThresholdType
  percent?: number // only relevant for supermajority, e.g. 0.66 = 66%
}

export interface GovernanceSettings {
  council: {
    minSize: number
    maxSize: number
    termLimitMonths: number // 0 = unlimited
    requiresElection: boolean
    nominationWindowDays: number
    recallSignaturePercent: number
  }
  voting: {
    thresholds: {
      constitution: VoteThreshold
      policy: VoteThreshold
      budget: VoteThreshold
      election: VoteThreshold
    }
    minParticipationPercent: number
    defaultDurationDays: number
  }
  proposal: {
    minSupportCount: number
    discussion: {
      minDays: number
    }
  }
  engagement: {
    points: {
      PROPOSAL_CREATED: number
      COMMENT_CREATED: number
      VOTE_CAST: number
      DELEGATION_RECEIVED: number
      DOCUMENT_VERSION_AUTHORED: number
    }
  }
  citizenship: {
    open: boolean              // Whether new citizenship applications are accepted
    minAccountAgeDays: number  // 0 = kein Minimum
    motivationMinChars: number
    ipWindowDays: number       // Fenster für IP-Duplikat-Prüfung
    councilGracePeriodDays: number // Grace period before council members can cancel citizenship
  }
  username: {
    changeCooldownDays: number // Mindestabstand zwischen Username-Änderungen
  }
  nation: {
    stage: string              // e.g. 'MVP', 'Beta', 'Active'
  }
  chat: {
    allowVisitors: boolean     // Whether visitors can participate in chat at all
    visitorChannels: 'none' | 'readonly' | 'readwrite'
  }
}

export const DEFAULT_GOVERNANCE_SETTINGS: GovernanceSettings = {
  council: {
    minSize: 3,
    maxSize: 11,
    termLimitMonths: 24,
    requiresElection: false,
    nominationWindowDays: 7,
    recallSignaturePercent: 0.15
  },
  voting: {
    thresholds: {
      constitution: { type: 'unanimous' },
      policy: { type: 'supermajority', percent: 0.66 },
      budget: { type: 'majority' },
      election: { type: 'majority' }
    },
    minParticipationPercent: 10,
    defaultDurationDays: 7
  },
  proposal: {
    minSupportCount: 5,
    discussion: {
      minDays: 3
    }
  },
  engagement: {
    points: {
      PROPOSAL_CREATED: 5,
      COMMENT_CREATED: 1,
      VOTE_CAST: 2,
      DELEGATION_RECEIVED: 1,
      DOCUMENT_VERSION_AUTHORED: 10
    }
  },
  citizenship: {
    open: true,
    minAccountAgeDays: 0,
    motivationMinChars: 300,
    ipWindowDays: 30,
    councilGracePeriodDays: 30
  },
  username: {
    changeCooldownDays: 90
  },
  nation: {
    stage: 'MVP'
  },
  chat: {
    allowVisitors: false,
    visitorChannels: 'none'
  }
}

export type SettingKey =
  | 'council.minSize'
  | 'council.maxSize'
  | 'council.termLimitMonths'
  | 'council.requiresElection'
  | 'council.nominationWindowDays'
  | 'council.recallSignaturePercent'
  | 'voting.thresholds.constitution'
  | 'voting.thresholds.policy'
  | 'voting.thresholds.budget'
  | 'voting.thresholds.election'
  | 'voting.minParticipationPercent'
  | 'voting.defaultDurationDays'
  | 'proposal.minSupportCount'
  | 'proposal.discussion.minDays'
  | 'engagement.points'
  | 'citizenship.open'
  | 'citizenship.minAccountAgeDays'
  | 'citizenship.motivationMinChars'
  | 'citizenship.ipWindowDays'
  | 'citizenship.councilGracePeriodDays'
  | 'username.changeCooldownDays'
  | 'nation.stage'
  | 'chat.allowVisitors'
  | 'chat.visitorChannels'

export interface SystemSettingUpdatedMeta {
  key: string
  oldValue: unknown
  newValue: unknown
  changedByRole: string
  changedByCivicStatus: string
}
