# Changelog

All notable changes to Gaya OS will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.4.0] – 2026-03-17

### Added
- DB-backed permission matrix (`RoleCapability` table) — all role capabilities stored and editable in the DB
- `SystemSetting` model for governance configuration (key/value JSON store with audit trail)
- Admin: Roles & Permissions page (`/admin/roles`) — editable matrix with Switch toggles per role and capability group
- Admin: Governance Settings page (`/admin/governance`) — tabbed UI for Council, Voting, Proposals and Engagement settings
- `COUNCIL_MEMBER` row in the capability matrix with council-specific capabilities (can_view_council_dashboard, can_review_proposals, can_initiate_internal_vote, can_initiate_sanction_vote, can_manage_council)
- `can_run_for_council` capability for Citizens, `can_manage_council` for Admins
- Flat `caps` map in `page.data` — all capabilities computed server-side per user and available in every route
- `hasCapability(user, capability)` server-side helper for API and action guards
- Governance settings domain types (`GovernanceSettings`, `DEFAULT_GOVERNANCE_SETTINGS`, `SettingKey`)
- Audit log entries for `SYSTEM_SETTING_UPDATED` and `ROLE_CAPABILITY_UPDATED` with old/new values

### Changed
- Permission model: `USER` role removed from matrix (default placeholder, no own capabilities); `MODERATOR` and `ADMIN` rows define only their extras — CITIZEN rights are merged via OR at runtime
- `/citizens/[username]` profile page now accessible for all users (not Citizens only) — citizenId badge and "Citizen since" shown conditionally
- All capability guards migrated from hardcoded `civicStatus === 'CITIZEN'` checks to dynamic `caps` / `hasCapability()` (settings/profile, community nav, citizen profile edit button, avatar/hero upload, id-card, admin/users)
- Admin/users page guards use `can_manage_users` capability instead of hardcoded ADMIN role check

### Fixed
- Visitor profile page no longer returns 404 when has_profile is enabled for Visitors

---

## [0.3.0] – 2026-03-17

### Added
- Citizen directory (`/citizens`) and public profiles (`/citizens/[username]`) with hero banner, avatar, bio, links and activity tab
- Avatar and banner upload via Vercel Blob with immediate preview update
- New citizen ID format `CX-ZZZZZZZZZZZZ` with admin migration action
- Dynamic breadcrumbs in app header for all routes
- "Community" sidebar group (Citizens, My Profile, ID Card / Citizenship) with role-aware visibility
- Activity log redesigned as compact log-line sentences with inline code/link styling

### Changed
- Profile settings: two-column desktop layout, Visitor-only sections hidden for Visitors
- `/citizenship` renamed to `/id-card`

---

## [0.2.1] – 2026-03-17

### Added
- Vercel Analytics (public pages only) and Speed Insights (all pages)

---

## [0.2.0] – 2026-03-16

### Added
- Activity log (`/activity`) with audit service, login/logout tracking and cursor-based pagination
- Document management with versioning (MAJOR.MINOR.PATCH), history, diffs and admin UI
- CodeMirror editor (Tokyo Night) for Markdown authoring
- Public `/constitution` page with parallax hero and rendered Markdown
- Landing page shows active constitution version dynamically
- Sidebar auto-closes on mobile when a nav item is tapped

### Fixed
- Prose rendering rewritten with custom `@layer components` styles matching the site's design system
- Responsive admin documents table (columns hidden on small screens)
- `redirect()` in `createDocument` action no longer caught as an error

---

## [0.1.1] – 2026-03-15

### Fixed
- Redirect to `/dashboard` after login (previously landed on public homepage)
- Switch from `@sveltejs/adapter-auto` to `@sveltejs/adapter-vercel` for faster builds
- Use `VERCEL_PROJECT_PRODUCTION_URL` instead of `VERCEL_URL` for Better Auth base URL
- Suppress optional peer dependency warnings (`better-sqlite3`, `pg-native`, `cloudflare:sockets`, `@react-email/render`)
- Add `workflow_dispatch` trigger to deploy workflow for manual deploys

---

## [0.1.0] – 2026-03-15

### Added

#### Infrastructure & Deployment
- Vercel deployment with Neon PostgreSQL (production)
- GitHub Actions workflow: deploy only on published releases
- PostgreSQL via `@prisma/adapter-pg` (local + production)
- Prisma 7 configuration via `prisma.config.ts`
- Automatic base URL detection (`VERCEL_URL` in production, `localhost` in development)

#### Authentication & User Management
- Email/password registration and login (Better Auth)
- Passkey support (WebAuthn via `@better-auth/passkey`)
- Username plugin
- Email verification flow with Resend
- Session management with SvelteKit integration
- Admin panel: user list, role management, email verification, user deletion

#### Identity & Civic Model
- Two-tier model: technical role (`USER`, `MODERATOR`, `ADMIN`) and civic status (`VISITOR`, `CITIZEN`)
- Citizen ID generation (`CX-YYYY-NNNN`)
- Digital citizen ID card (`/id-card`)
- Citizenship application flow with constitution acknowledgement
- Audit log for status changes

#### Public Pages
- Landing page with hero section and feature overview
- Constitution page (`/constitution`) with full text
- About page (`/about`)
- Contact form with Resend email delivery

#### Domain Model
- Units (micronation subdivisions) with memberships and councils
- Proposals with categories, discussion status, and support system
- Vote sessions (Poll, Decision, Election) with Yes/No/Abstain choices
- Liquid democracy: delegations per category
- Budget simulation: annual budgets and budget projects
- Documents (Constitution, Policy) with versioning and status

---

## [Unreleased]

- Council management UI
- Proposal creation and discussion flow
- Voting interface
- Delegation management
- Budget UI
- Citizen dashboard
