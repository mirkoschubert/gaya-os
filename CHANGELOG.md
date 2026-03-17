# Changelog

All notable changes to Gaya OS will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
