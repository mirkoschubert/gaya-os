import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { passkey } from '@better-auth/passkey'
import { username } from 'better-auth/plugins'
import { svelteKitHandler } from 'better-auth/svelte-kit'
import { prisma } from './prisma'
import { sendVerificationEmail } from './email'
import { getBaseUrl } from '$lib/url'

export const auth = betterAuth({
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
      }
    }
  }
})

export { svelteKitHandler }
export type Auth = typeof auth
