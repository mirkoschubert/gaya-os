# Gaya OS

A platform for a virtual micro-nation with council-democratic governance. Visitors can join, apply for citizenship, receive a digital ID, and participate in councils, votes, and a simulated civic budget.

> An experimental lab for council-democratic, non-capitalist governance structures.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [SvelteKit](https://svelte.dev/docs/kit) |
| UI | [shadcn-svelte](https://www.shadcn-svelte.com/) + Tailwind CSS |
| Auth | [better-auth](https://www.better-auth.com/) (email/password, passkeys, username) |
| Database | SQLite via [Prisma](https://www.prisma.io/) (dev) · PostgreSQL (production) |
| Email | [Resend](https://resend.com/) |
| Deployment | [Vercel](https://vercel.com/) |

## Features (MVP)

- **Onboarding & Identity** — Visitor registration, citizenship application, digital citizen ID (`CX-YYYY-NNNN`)
- **Authentication** — Email/password login, username login, passkeys (WebAuthn), email verification
- **User roles** — `USER`, `MODERATOR`, `ADMIN` (technical) · `VISITOR`, `CITIZEN` (civic status)
- **Admin panel** — User management: roles, email verification, delete
- **Settings** — Profile (name, username), password change, passkey management, active sessions

Coming soon: Proposals, Votes, Liquid Democracy, Civic Budget, Constitution documents.

## Getting Started

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 9

### Setup

```sh
# Install dependencies
pnpm install

# Copy environment variables and fill in the values
cp .env.example .env

# Run database migrations and generate Prisma client
pnpm prisma migrate dev
pnpm prisma generate

# Start the development server
pnpm dev
```

### Environment Variables

See [`.env.example`](.env.example) for all required variables:

| Variable | Description |
|---|---|
| `BETTER_AUTH_SECRET` | Random secret for session signing (min. 32 chars) |
| `BETTER_AUTH_URL` | Base URL of the app (e.g. `http://localhost:5173`) |
| `DATABASE_URL` | SQLite: `file:./prisma/dev.db` · Postgres: connection string |
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com/) |
| `RESEND_FROM_EMAIL` | Sender address (requires verified domain; leave empty for test mode) |

### Database

```sh
# Create and apply a new migration
pnpm prisma migrate dev --name <description>

# Regenerate Prisma client after schema changes
pnpm prisma generate

# Open Prisma Studio (database GUI)
pnpm prisma studio
```

> **Note:** After every migration, run `pnpm prisma generate` to keep the Prisma client in sync.

## Project Structure

```
src/
├── lib/
│   ├── components/ui/     # shadcn-svelte components
│   ├── domain/            # TypeScript domain types (AppUser, roles, etc.)
│   ├── server/
│   │   ├── auth.ts        # better-auth configuration
│   │   ├── email.ts       # Resend email helper
│   │   ├── prisma.ts      # Prisma client singleton
│   │   └── services/      # Domain logic (citizenship, user management)
│   └── auth-client.ts     # better-auth browser client
└── routes/
    ├── (app)/             # Authenticated app shell (sidebar layout)
    │   ├── admin/         # Admin panel (ADMIN role only)
    │   ├── dashboard/
    │   ├── citizenship/
    │   └── settings/
    └── (public)/          # Public pages (landing, auth)
        └── auth/          # Login, register
```

## License

MIT — see [LICENSE](LICENSE) for details.
