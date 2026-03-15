# Changelog

All notable changes to Gaya OS will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
