<script lang="ts">
  import { authClient } from '$lib/auth-client'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'

  let email = $state('')
  let loading = $state(false)
  let sent = $state(false)
  let error = $state<string | null>(null)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    loading = true
    error = null

    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: '/auth/reset-password'
    })

    if (result.error) {
      error = result.error.message ?? 'Something went wrong. Please try again.'
    } else {
      sent = true
    }

    loading = false
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title class="text-2xl">Reset your password</Card.Title>
    <Card.Description>
      Enter your email address and we'll send you a link to reset your password.
    </Card.Description>
  </Card.Header>
  {#if sent}
    <Card.Content>
      <p class="text-sm text-green-600">
        If an account exists for <strong>{email}</strong>, you'll receive a reset link shortly.
        Check your inbox and spam folder.
      </p>
    </Card.Content>
  {:else}
    <Card.Content>
      <form onsubmit={handleSubmit} class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <Label for="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            bind:value={email}
            required
            autocomplete="email"
          />
        </div>
        {#if error}
          <p class="text-destructive text-sm">{error}</p>
        {/if}
        <Button type="submit" disabled={loading} class="w-full">
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </Card.Content>
  {/if}
  <Card.Footer class="justify-center text-sm">
    <a href="/auth/login" class="underline">Back to sign in</a>
  </Card.Footer>
</Card.Root>
