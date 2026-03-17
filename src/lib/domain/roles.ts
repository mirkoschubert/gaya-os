// Pure domain types and constants for the Roles & Permissions system.
// No Prisma, no HTTP — safe to import anywhere including client-side code.

export const ROLES = ['VISITOR', 'CITIZEN', 'COUNCIL_MEMBER', 'MODERATOR', 'ADMIN'] as const
export type AppRole = (typeof ROLES)[number]

export interface Capability {
  key: string
  label: string
}

export interface CapabilityGroup {
  label: string
  capabilities: Capability[]
}

export const CAPABILITY_GROUPS: CapabilityGroup[] = [
  {
    label: 'Profile',
    capabilities: [
      { key: 'has_profile', label: 'Has a profile' },
      { key: 'can_view_profiles', label: 'View profiles' },
      { key: 'can_edit_own_profile', label: 'Edit own profile' },
      { key: 'can_delete_own_account', label: 'Delete own account' }
    ]
  },
  {
    label: 'Content',
    capabilities: [
      { key: 'can_view_proposals', label: 'View proposals' },
      { key: 'can_create_proposals', label: 'Create proposals' },
      { key: 'can_comment', label: 'Comment' },
      { key: 'can_support_proposals', label: 'Support proposals' }
    ]
  },
  {
    label: 'Voting',
    capabilities: [
      { key: 'can_vote', label: 'Vote' },
      { key: 'can_delegate', label: 'Delegate vote' },
      { key: 'can_be_delegate', label: 'Be a delegate' }
    ]
  },
  {
    label: 'Governance',
    capabilities: [
      { key: 'can_apply_citizenship', label: 'Apply for citizenship' },
      { key: 'can_access_admin', label: 'Access admin area' },
      { key: 'can_manage_users', label: 'Manage users' },
      { key: 'can_manage_documents', label: 'Manage documents' },
      { key: 'can_manage_settings', label: 'Manage settings' },
      { key: 'can_moderate_content', label: 'Moderate content' }
    ]
  },
  {
    label: 'Council',
    capabilities: [
      { key: 'can_run_for_council', label: 'Run for council' },
      { key: 'can_view_council_dashboard', label: 'Access council dashboard' },
      { key: 'can_review_proposals', label: 'Review and advance proposals' },
      { key: 'can_initiate_internal_vote', label: 'Initiate council internal vote' },
      { key: 'can_initiate_sanction_vote', label: 'Initiate sanction vote' },
      { key: 'can_manage_council', label: 'Manage council structure' }
    ]
  }
]

export const ALL_CAPABILITIES: Capability[] = CAPABILITY_GROUPS.flatMap((g) => g.capabilities)

// PermissionMatrix[role][capability] = allowed
export type PermissionMatrix = Record<string, Record<string, boolean>>

export interface RoleCapabilityUpdatedMeta {
  role: string
  capability: string
  oldValue: boolean
  newValue: boolean
}

export const DEFAULT_MATRIX: PermissionMatrix = {
  VISITOR: {
    has_profile: false,
    can_view_profiles: true,
    can_edit_own_profile: false,
    can_delete_own_account: false,
    can_view_proposals: true,
    can_create_proposals: false,
    can_comment: false,
    can_support_proposals: false,
    can_vote: false,
    can_delegate: false,
    can_be_delegate: false,
    can_apply_citizenship: true,
    can_access_admin: false,
    can_manage_users: false,
    can_manage_documents: false,
    can_manage_settings: false,
    can_moderate_content: false,
    can_run_for_council: false,
    can_view_council_dashboard: false,
    can_review_proposals: false,
    can_initiate_internal_vote: false,
    can_initiate_sanction_vote: false,
    can_manage_council: false
  },
  CITIZEN: {
    has_profile: true,
    can_view_profiles: true,
    can_edit_own_profile: true,
    can_delete_own_account: true,
    can_view_proposals: true,
    can_create_proposals: true,
    can_comment: true,
    can_support_proposals: true,
    can_vote: true,
    can_delegate: true,
    can_be_delegate: true,
    can_apply_citizenship: false,
    can_access_admin: false,
    can_manage_users: false,
    can_manage_documents: false,
    can_manage_settings: false,
    can_moderate_content: false,
    can_run_for_council: true,
    can_view_council_dashboard: false,
    can_review_proposals: false,
    can_initiate_internal_vote: false,
    can_initiate_sanction_vote: false,
    can_manage_council: false
  },
  // COUNCIL_MEMBER row: only the extra rights beyond CITIZEN.
  // At runtime, capabilities are merged (OR) with the CITIZEN row via an
  // isCouncilMember flag in +layout.server.ts.
  COUNCIL_MEMBER: {
    has_profile: false,
    can_view_profiles: false,
    can_edit_own_profile: false,
    can_delete_own_account: false,
    can_view_proposals: false,
    can_create_proposals: false,
    can_comment: false,
    can_support_proposals: false,
    can_vote: false,
    can_delegate: false,
    can_be_delegate: false,
    can_apply_citizenship: false,
    can_access_admin: false,
    can_manage_users: false,
    can_manage_documents: false,
    can_manage_settings: false,
    can_moderate_content: false,
    can_run_for_council: false,
    can_view_council_dashboard: true,
    can_review_proposals: true,
    can_initiate_internal_vote: true,
    can_initiate_sanction_vote: true,
    can_manage_council: false
  },
  // MODERATOR row: only the extra technical rights beyond CITIZEN.
  MODERATOR: {
    has_profile: false,
    can_view_profiles: false,
    can_edit_own_profile: false,
    can_delete_own_account: false,
    can_view_proposals: false,
    can_create_proposals: false,
    can_comment: false,
    can_support_proposals: false,
    can_vote: false,
    can_delegate: false,
    can_be_delegate: false,
    can_apply_citizenship: false,
    can_access_admin: false,
    can_manage_users: false,
    can_manage_documents: false,
    can_manage_settings: false,
    can_moderate_content: true,
    can_run_for_council: false,
    can_view_council_dashboard: false,
    can_review_proposals: false,
    can_initiate_internal_vote: false,
    can_initiate_sanction_vote: false,
    can_manage_council: false
  },
  // ADMIN row: only the extra technical rights beyond CITIZEN.
  ADMIN: {
    has_profile: false,
    can_view_profiles: false,
    can_edit_own_profile: false,
    can_delete_own_account: false,
    can_view_proposals: false,
    can_create_proposals: false,
    can_comment: false,
    can_support_proposals: false,
    can_vote: false,
    can_delegate: false,
    can_be_delegate: false,
    can_apply_citizenship: false,
    can_access_admin: true,
    can_manage_users: true,
    can_manage_documents: true,
    can_manage_settings: true,
    can_moderate_content: true,
    can_run_for_council: false,
    can_view_council_dashboard: true,
    can_review_proposals: false,
    can_initiate_internal_vote: false,
    can_initiate_sanction_vote: false,
    can_manage_council: true
  }
}
