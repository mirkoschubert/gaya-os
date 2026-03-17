import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { passkey } from '@better-auth/passkey'
import { username } from 'better-auth/plugins'
import { svelteKitHandler } from 'better-auth/svelte-kit'
import { BETTER_AUTH_SECRET } from '$env/static/private'
import { prisma } from './prisma'
import { sendVerificationEmail } from './email'
import { logAction } from './services/audit'
import { getBaseUrl } from '$lib/url'

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: getBaseUrl(),
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  plugins: [passkey(), username()],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: false,
    requireEmailVerification: false
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ to: user.email, url })
    },
    autoSignInAfterVerification: true,
    sendOnSignUp: true
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await logAction({
            userId: user.id,
            action: 'USER_REGISTERED',
            entityType: 'USER',
            entityId: user.id,
            metadata: { email: user.email }
          })
        }
      }
    },
    session: {
      create: {
        after: async (session) => {
          await Promise.all([
            prisma.user.update({
              where: { id: session.userId },
              data: { lastLogin: new Date() }
            }),
            logAction({
              userId: session.userId,
              action: 'USER_LOGGED_IN',
              entityType: 'USER',
              entityId: session.userId
            })
          ])
        }
      },
      delete: {
        before: async (session) => {
          await logAction({
            userId: session.userId,
            action: 'USER_LOGGED_OUT',
            entityType: 'USER',
            entityId: session.userId
          })
        }
      }
    }
  },

  user: {
    additionalFields: {
      firstName: {
        type: 'string',
        required: true,
        input: true
      },
      lastName: {
        type: 'string',
        required: true,
        input: true
      },
      role: {
        type: 'string',
        defaultValue: 'USER',
        input: false // Cannot be set by the client during signup
      },
      civicStatus: {
        type: 'string',
        defaultValue: 'VISITOR',
        input: false
      },
      citizenId: {
        type: 'string',
        required: false,
        input: false
      },
      joinedAt: {
        type: 'date',
        required: false,
        input: false
      },
      lastLogin: {
        type: 'date',
        required: false,
        input: false
      },
      bio: {
        type: 'string',
        required: false,
        input: true
      },
      location: {
        type: 'string',
        required: false,
        input: true
      },
      links: {
        type: 'string', // stored as JSON string
        required: false,
        input: true
      },
      avatarUrl: {
        type: 'string',
        required: false,
        input: false
      },
      heroUrl: {
        type: 'string',
        required: false,
        input: false
      },
      showRealName: {
        type: 'boolean',
        defaultValue: true,
        input: true
      }
    }
  }
})

export { svelteKitHandler }
export type Auth = typeof auth
