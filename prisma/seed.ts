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

// ─── Username Blacklist ───────────────────────────────────────────────────────
// Exact strings are matched case-insensitively.
// Entries starting with ^ are treated as full regex patterns by the username service.
const USERNAME_BLACKLIST: Array<{ pattern: string; reason: string }> = [
  // ── Reserved: system / platform names ────────────────────────────────────
  { pattern: 'admin', reason: 'Reserved system name' },
  { pattern: 'administrator', reason: 'Reserved system name' },
  { pattern: 'moderator', reason: 'Reserved system name' },
  { pattern: 'mod', reason: 'Reserved system name' },
  { pattern: 'root', reason: 'Reserved system name' },
  { pattern: 'system', reason: 'Reserved system name' },
  { pattern: 'support', reason: 'Reserved system name' },
  { pattern: 'help', reason: 'Reserved system name' },
  { pattern: 'staff', reason: 'Reserved system name' },
  { pattern: 'official', reason: 'Reserved system name' },
  { pattern: 'gaya', reason: 'Reserved - platform name' },
  { pattern: 'gayaos', reason: 'Reserved - platform name' },
  { pattern: 'civitas', reason: 'Reserved - platform name' },
  { pattern: 'council', reason: 'Reserved - institutional name' },
  { pattern: 'president', reason: 'Reserved - institutional name' },
  { pattern: 'chancellor', reason: 'Reserved - institutional name' },
  { pattern: 'minister', reason: 'Reserved - institutional name' },
  // ── Reserved: technical keywords ─────────────────────────────────────────
  { pattern: 'null', reason: 'Reserved - technical keyword' },
  { pattern: 'undefined', reason: 'Reserved - technical keyword' },
  { pattern: 'true', reason: 'Reserved - technical keyword' },
  { pattern: 'false', reason: 'Reserved - technical keyword' },
  { pattern: 'me', reason: 'Reserved - too generic' },
  { pattern: 'you', reason: 'Reserved - too generic' },
  { pattern: 'everyone', reason: 'Reserved - ambiguous mass-address' },
  { pattern: 'anonymous', reason: 'Reserved - impersonation risk' },
  // ── Racial slurs ─────────────────────────────────────────────────────────
  { pattern: 'nigger', reason: 'Racial slur' },
  { pattern: 'nigga', reason: 'Racial slur' },
  { pattern: 'spic', reason: 'Racial slur' },
  { pattern: 'chink', reason: 'Racial slur' },
  { pattern: 'wetback', reason: 'Racial slur' },
  { pattern: 'gook', reason: 'Racial slur' },
  { pattern: 'towelhead', reason: 'Racial/ethnic slur' },
  { pattern: 'sandnigger', reason: 'Racial slur' },
  { pattern: 'zipperhead', reason: 'Racial slur' },
  { pattern: 'neger', reason: 'Racial slur' },
  { pattern: 'kanake', reason: 'Racial/ethnic slur' },
  // ── Antisemitic terms ─────────────────────────────────────────────────────
  { pattern: 'kike', reason: 'Antisemitic slur' },
  { pattern: 'judensau', reason: 'Antisemitic slur' },
  // ── Homophobic / transphobic slurs ───────────────────────────────────────
  { pattern: 'faggot', reason: 'Homophobic slur' },
  { pattern: 'fag', reason: 'Homophobic slur' },
  { pattern: 'dyke', reason: 'Homophobic slur' },
  { pattern: 'tranny', reason: 'Transphobic slur' },
  // ── Nazi / far-right extremism (regex covers variants) ───────────────────
  { pattern: 'nazi', reason: 'Hate speech - far-right extremism' },
  { pattern: '^.*hitler.*$', reason: 'Hate speech - Nazi reference' },
  { pattern: '^heil.*$', reason: 'Hate speech - Nazi salute' },
  { pattern: 'hitlerjugend', reason: 'Hate speech - Nazi organisation' },
  { pattern: '^.*ss.*waffen.*$', reason: 'Hate speech - Nazi paramilitary reference' },
  { pattern: 'volksverhetzung', reason: 'Hate speech - incitement to hatred' },
  { pattern: 'auslaenderraus', reason: 'Hate speech - xenophobic slogan' },
  { pattern: 'kkk', reason: 'Hate speech - terrorist organisation (KKK)' },
  // ── Terrorist organisations ───────────────────────────────────────────────
  { pattern: 'isis', reason: 'Banned - terrorist organisation' },
  { pattern: 'daesh', reason: 'Banned - terrorist organisation' },
  { pattern: '^al.?qaeda$', reason: 'Banned - terrorist organisation' },
  // ── Profanity ─────────────────────────────────────────────────────────────
  { pattern: '^f+u+c+k+.*$', reason: 'Profanity' },
  { pattern: 'motherfucker', reason: 'Profanity' },
  { pattern: 'asshole', reason: 'Profanity' },
  { pattern: 'cunt', reason: 'Profanity' },
  { pattern: 'bastard', reason: 'Profanity' },
  { pattern: 'whore', reason: 'Profanity / misogynistic slur' },
  { pattern: 'slut', reason: 'Profanity / misogynistic slur' },
  { pattern: 'bitch', reason: 'Profanity' },
  // ── CSAM / illegal content ────────────────────────────────────────────────
  { pattern: '^pedo.*$', reason: 'Illegal - CSAM-related' },
  { pattern: 'pedophile', reason: 'Illegal - CSAM-related' },
  { pattern: 'kiddieporn', reason: 'Illegal - CSAM-related' },
  { pattern: 'childporn', reason: 'Illegal - CSAM-related' },
]

async function seedUsernameBlacklist() {
  console.log('Seeding UsernameBlacklist...')
  let added = 0
  for (const entry of USERNAME_BLACKLIST) {
    await prisma.usernameBlacklist.upsert({
      where: { pattern: entry.pattern },
      update: { reason: entry.reason },
      create: { pattern: entry.pattern, reason: entry.reason }
    })
    added++
  }
  console.log(`Seeded ${added} username blacklist entries.`)
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

  await seedUsernameBlacklist()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
