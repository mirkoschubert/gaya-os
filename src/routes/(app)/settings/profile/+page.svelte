<script lang="ts">
  import { authClient, useSession } from '$lib/auth-client'
  import type { AppUser } from '$lib/domain/auth'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Separator } from '$lib/components/ui/separator'
  import { TriangleAlert } from '@lucide/svelte'

  const session = useSession()

  // Cast to AppUser to access our custom fields
  const user = $derived($session.data?.user as AppUser | undefined)
  const emailVerified = $derived(($session.data?.user as { emailVerified?: boolean } | undefined)?.emailVerified ?? true)

  let resendLoading = $state(false)
  let resendDone = $state(false)
  let resendError = $state<string | null>(null)

  async function handleResendVerification() {
    resendLoading = true
    resendError = null
    const result = await authClient.sendVerificationEmail({
      email: $session.data?.user?.email ?? '',
      callbackURL: '/settings/profile'
    })
    if (result.error) {
      resendError = result.error.message ?? 'Failed to send verification email.'
    } else {
      resendDone = true
    }
    resendLoading = false
  }

  // Identity
  let firstName = $state('')
  let lastName = $state('')
  let username = $state('')
  let identityLoading = $state(false)
  let identityError = $state<string | null>(null)
  let identitySuccess = $state(false)

  $effect(() => {
    if (user) {
      firstName = user.firstName ?? ''
      lastName = user.lastName ?? ''
      username = user.username ?? ''
    }
  })

  async function handleUpdateIdentity(e: Event) {
    e.preventDefault()
    identityLoading = true
    identityError = null
    identitySuccess = false

    const result = await authClient.updateUser({
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      username
    } as Parameters<typeof authClient.updateUser>[0])

    if (result.error) {
      console.error('updateUser error:', result.error)
      identityError = `${result.error.status ?? ''} ${result.error.message ?? 'Failed to update profile.'}`.trim()
    } else {
      identitySuccess = true
    }
    identityLoading = false
  }

  // Change password
  let currentPassword = $state('')
  let newPassword = $state('')
  let passwordLoading = $state(false)
  let passwordError = $state<string | null>(null)
  let passwordSuccess = $state(false)

  async function handleChangePassword(e: Event) {
    e.preventDefault()
    passwordLoading = true
    passwordError = null
    passwordSuccess = false

    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: false
    })

    if (result.error) {
      passwordError = result.error.message ?? 'Failed to change password.'
    } else {
      passwordSuccess = true
      currentPassword = ''
      newPassword = ''
    }
    passwordLoading = false
  }
</script>

<svelte:head><title>Profile Settings · Gaya OS</title></svelte:head>

<div class="max-w-lg space-y-6">
  {#if !emailVerified}
    <div class="flex items-start gap-3 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
      <TriangleAlert class="mt-0.5 size-4 shrink-0" />
      <div class="flex-1">
        <p class="font-medium">Your email address is not verified.</p>
        <p class="mt-0.5 text-xs opacity-80">
          Some features may be restricted until you verify your email.
        </p>
        {#if resendDone}
          <p class="mt-2 text-xs font-medium">Verification email sent — check your inbox.</p>
        {:else}
          <button
            type="button"
            class="mt-2 text-xs font-medium underline underline-offset-2 disabled:opacity-50"
            disabled={resendLoading}
            onclick={handleResendVerification}
          >
            {resendLoading ? 'Sending…' : 'Resend verification email'}
          </button>
          {#if resendError}
            <p class="mt-1 text-xs text-red-600">{resendError}</p>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
  <Card.Root>
    <Card.Header>
      <Card.Title>Profile</Card.Title>
      <Card.Description>Update your name and username.</Card.Description>
    </Card.Header>
    <Card.Content>
      <form onsubmit={handleUpdateIdentity} class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <Label for="firstName">First name</Label>
            <Input
              id="firstName"
              type="text"
              bind:value={firstName}
              required
              autocomplete="given-name"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="lastName">Last name</Label>
            <Input
              id="lastName"
              type="text"
              bind:value={lastName}
              required
              autocomplete="family-name"
            />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="username">Username</Label>
          <div class="relative">
            <span
              class="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none"
              >@</span
            >
            <Input
              id="username"
              type="text"
              bind:value={username}
              required
              autocomplete="username"
              class="pl-7"
            />
          </div>
        </div>
        {#if identityError}
          <p class="text-destructive text-sm">{identityError}</p>
        {/if}
        {#if identitySuccess}
          <p class="text-sm text-green-600">Profile updated successfully.</p>
        {/if}
        <Button type="submit" disabled={identityLoading} class="self-start">
          {identityLoading ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </Card.Content>
  </Card.Root>

  <Separator />

  <Card.Root>
    <Card.Header>
      <Card.Title>Change Password</Card.Title>
      <Card.Description>Set a new password for your account.</Card.Description>
    </Card.Header>
    <Card.Content>
      <form onsubmit={handleChangePassword} class="flex flex-col gap-4">
        <!-- Hidden username field for password manager A11y (WCAG / Chrome autofill) -->
        <input
          type="text"
          autocomplete="username"
          aria-hidden="true"
          tabindex="-1"
          style="display:none"
          value={user?.username ?? user?.email ?? ''}
        />
        <div class="flex flex-col gap-1.5">
          <Label for="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            bind:value={currentPassword}
            required
            autocomplete="current-password"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            bind:value={newPassword}
            required
            minlength={8}
            autocomplete="new-password"
          />
        </div>
        {#if passwordError}
          <p class="text-destructive text-sm">{passwordError}</p>
        {/if}
        {#if passwordSuccess}
          <p class="text-sm text-green-600">Password changed successfully.</p>
        {/if}
        <Button type="submit" disabled={passwordLoading} class="self-start">
          {passwordLoading ? 'Changing…' : 'Change password'}
        </Button>
      </form>
    </Card.Content>
  </Card.Root>
</div>
