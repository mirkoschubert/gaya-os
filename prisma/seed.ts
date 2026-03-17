import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! })
const prisma = new PrismaClient({ adapter })

// USER is intentionally omitted: it is a default technical role only.
// COUNCIL_MEMBER is resolved from Membership.role at runtime, not from UserRole.
// MODERATOR and ADMIN always have CITIZEN CivicStatus — their rows define
// only the additional technical capabilities on top of CITIZEN.
const ROLES = ['VISITOR', 'CITIZEN', 'COUNCIL_MEMBER', 'MODERATOR', 'ADMIN'] as const

const DEFAULT_MATRIX: Record<string, Record<string, boolean>> = {
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
  // isCouncilMember flag in +layout.server.ts (Membership.role = COUNCIL_MEMBER).
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

async function main() {
  console.log('Seeding RoleCapability matrix...')

  // Remove obsolete rows from previous seeds
  await prisma.roleCapability.deleteMany({ where: { capability: 'can_edit_any_profile' } })
  await prisma.roleCapability.deleteMany({ where: { capability: 'can_delete_any_account' } })
  await prisma.roleCapability.deleteMany({ where: { role: 'USER' } })

  for (const role of ROLES) {
    const capabilities = DEFAULT_MATRIX[role]
    for (const [capability, allowed] of Object.entries(capabilities)) {
      await prisma.roleCapability.upsert({
        where: { role_capability: { role, capability } },
        update: {},
        create: { role, capability, allowed }
      })
    }
  }

  console.log(`Seeded ${ROLES.length} roles with ${Object.keys(DEFAULT_MATRIX.CITIZEN).length} capabilities each.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
