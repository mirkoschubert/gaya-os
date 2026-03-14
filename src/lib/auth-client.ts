import { createAuthClient } from 'better-auth/svelte'
import { passkeyClient } from '@better-auth/passkey/client'
import { usernameClient } from 'better-auth/client/plugins'
import { PUBLIC_APP_URL } from '$env/static/public'

export const authClient = createAuthClient({
  baseURL: PUBLIC_APP_URL,
  plugins: [passkeyClient(), usernameClient()]
})

export const { signIn, signUp, signOut, useSession } = authClient
