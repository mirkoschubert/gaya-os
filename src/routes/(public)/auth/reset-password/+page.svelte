<script lang="ts">
  import { authClient } from '$lib/auth-client'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Eye, EyeOff } from '@lucide/svelte'

  const token = $derived(page.url.searchParams.get('token') ?? '')

  let newPassword = $state('')
  let confirmPassword = $state('')
  let loading = $state(false)
  let error = $state<string | null>(null)
  let showPassword = $state(false)
  let showConfirm = $state(false)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      error = 'Passwords do not match.'
      return
    }
    if (!token) {
      error = 'Invalid or expired reset link. Please request a new one.'
      return
    }

    loading = true
    error = null

    const result = await authClient.resetPassword({
      newPassword,
      token
    })

    if (result.error) {
      error = result.error.message ?? 'Failed to reset password. The link may have expired.'
    } else {
      await goto('/auth/login?reset=1')
    }

    loading = false
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title class="text-2xl">Set new password</Card.Title>
    <Card.Description>
      Choose a new password for your account.
    </Card.Description>
  </Card.Header>
  <Card.Content>
    {#if !token}
      <p class="text-destructive text-sm">
        Invalid or missing reset token. Please
        <a href="/auth/forgot-password" class="underline">request a new reset link</a>.
      </p>
    {:else}
      <form onsubmit={handleSubmit} class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <Label for="newPassword">New password</Label>
          <div class="relative">
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              bind:value={newPassword}
              required
              minlength={8}
              autocomplete="new-password"
              class="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onclick={() => (showPassword = !showPassword)}
              tabindex={-1}
            >
              {#if showPassword}<EyeOff class="h-4 w-4" />{:else}<Eye class="h-4 w-4" />{/if}
            </Button>
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="confirmPassword">Confirm password</Label>
          <div class="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              bind:value={confirmPassword}
              required
              autocomplete="new-password"
              class="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onclick={() => (showConfirm = !showConfirm)}
              tabindex={-1}
            >
              {#if showConfirm}<EyeOff class="h-4 w-4" />{:else}<Eye class="h-4 w-4" />{/if}
            </Button>
          </div>
          {#if confirmPassword && newPassword !== confirmPassword}
            <p class="text-destructive text-xs">Passwords do not match.</p>
          {/if}
        </div>
        {#if error}
          <p class="text-destructive text-sm">{error}</p>
        {/if}
        <Button type="submit" disabled={loading} class="w-full">
          {loading ? 'Saving…' : 'Set new password'}
        </Button>
      </form>
    {/if}
  </Card.Content>
  <Card.Footer class="justify-center text-sm">
    <a href="/auth/login" class="underline">Back to sign in</a>
  </Card.Footer>
</Card.Root>
