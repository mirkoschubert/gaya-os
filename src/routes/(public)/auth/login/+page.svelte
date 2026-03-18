<script lang="ts">
  import { signIn, authClient } from '$lib/auth-client'
  import { goto } from '$app/navigation'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'

  let identifier = $state('') // email or username
  let password = $state('')
  let error = $state<string | null>(null)
  let loading = $state(false)
  let passkeyLoading = $state(false)

  async function handleLogin(e: Event) {
    e.preventDefault()
    loading = true
    error = null

    const isEmail = identifier.includes('@')
    const result = isEmail
      ? await signIn.email({ email: identifier, password })
      : await authClient.signIn.username({ username: identifier, password })

    if (result.error) {
      error =
        result.error.message ?? 'Login failed. Please check your credentials.'
    } else {
      await goto('/dashboard')
    }

    loading = false
  }

  async function handlePasskeyLogin() {
    passkeyLoading = true
    error = null

    const result = await authClient.signIn.passkey()

    if (result?.error) {
      error = result.error.message ?? 'Passkey sign-in failed.'
    } else if (result?.data) {
      await goto('/dashboard')
    }

    passkeyLoading = false
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title class="text-2xl">Sign in</Card.Title>
    <Card.Description
      >Enter your credentials to access your account.</Card.Description
    >
  </Card.Header>
  <Card.Content class="flex flex-col gap-4">
    <form onsubmit={handleLogin} class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <Label for="identifier">Email or username</Label>
        <Input
          id="identifier"
          type="text"
          placeholder="you@example.com or @handle"
          bind:value={identifier}
          required
          autocomplete="username"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <Label for="password">Password</Label>
          <a href="/auth/forgot-password" class="text-muted-foreground text-xs underline">Forgot password?</a>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Your password"
          bind:value={password}
          required
          autocomplete="current-password"
        />
      </div>
      {#if error}
        <p class="text-destructive text-sm">{error}</p>
      {/if}
      <Button type="submit" disabled={loading} class="w-full">
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>

    <div class="flex items-center gap-3">
      <hr class="border-border flex-1" />
      <span class="text-muted-foreground text-xs uppercase">or</span>
      <hr class="border-border flex-1" />
    </div>

    <Button
      type="button"
      variant="outline"
      class="w-full"
      disabled={passkeyLoading}
      onclick={handlePasskeyLogin}
    >
      {passkeyLoading ? 'Authenticating…' : 'Sign in with Passkey'}
    </Button>
  </Card.Content>
  <Card.Footer class="justify-center text-sm">
    No account yet?&nbsp;<a href="/auth/register" class="underline"
      >Create one</a
    >
  </Card.Footer>
</Card.Root>
