<script lang="ts">
  import { authClient, useSession } from '$lib/auth-client'
  import { enhance } from '$app/forms'
  import type { AppUser } from '$lib/domain/auth'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Separator } from '$lib/components/ui/separator'
  import { TriangleAlert, Eye, EyeOff, CircleCheck, CircleX, LoaderCircle } from '@lucide/svelte'
  import type { PageData, ActionData } from './$types'

  interface Props {
    data: PageData
    form: ActionData
  }

  let { data, form }: Props = $props()

  const session = useSession()

  const user = $derived($session.data?.user as AppUser | undefined)
  const emailVerified = $derived(($session.data?.user as { emailVerified?: boolean } | undefined)?.emailVerified ?? true)

  // ─── Email verification ───
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

  // ─── Identity + Username ───
  let firstName = $state('')
  let lastName = $state('')
  let username = $state('')
  let identityLoading = $state(false)
  let identityError = $state<string | null>(null)
  let identitySuccess = $state(false)
  let usernameLoading = $state(false)
  let usernameServerError = $state<string | null>(null)
  let usernameSuccess = $state(false)

  const cooldown = $derived(data.usernameCooldown)
  const cooldownDate = $derived(
    cooldown.availableAt
      ? new Date(cooldown.availableAt).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        })
      : null
  )

  $effect(() => {
    if (user) {
      firstName = user.firstName ?? ''
      lastName = user.lastName ?? ''
      username = user.username ?? ''
    }
  })

  $effect(() => {
    if (form?.success) usernameSuccess = true
    if (form?.error) usernameServerError = form.error
  })

  async function handleUpdateName(e: Event) {
    e.preventDefault()
    identityLoading = true
    identityError = null
    identitySuccess = false

    const result = await authClient.updateUser({
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName
    } as Parameters<typeof authClient.updateUser>[0])

    if (result.error) {
      identityError = `${result.error.status ?? ''} ${result.error.message ?? 'Failed to update.'}`.trim()
    } else {
      identitySuccess = true
    }
    identityLoading = false
  }

  // Live username availability check
  type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'blacklisted' | 'invalid'
  let usernameStatus = $state<UsernameStatus>('idle')
  let usernameBlacklistReason = $state<string | null>(null)
  let usernameDebounceTimer: ReturnType<typeof setTimeout> | null = null

  function onUsernameInput() {
    usernameStatus = 'idle'
    usernameBlacklistReason = null
    usernameSuccess = false
    usernameServerError = null
    if (usernameDebounceTimer) clearTimeout(usernameDebounceTimer)
    if (!username || username.length < 3) return
    if (username === (user?.username ?? '')) { usernameStatus = 'idle'; return }
    usernameStatus = 'checking'
    usernameDebounceTimer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ username })
        if (user?.id) params.set('excludeUserId', user.id)
        const res = await fetch(`/api/username/check?${params}`)
        const json = await res.json()
        if (json.reason === 'invalid') usernameStatus = 'invalid'
        else if (json.available) usernameStatus = 'available'
        else if (json.reason === 'blacklisted') {
          usernameStatus = 'blacklisted'
          usernameBlacklistReason = json.blacklistReason ?? null
        } else usernameStatus = 'taken'
      } catch {
        usernameStatus = 'idle'
      }
    }, 300)
  }

  // ─── Password ───
  let currentPassword = $state('')
  let newPassword = $state('')
  let passwordLoading = $state(false)
  let passwordError = $state<string | null>(null)
  let passwordSuccess = $state(false)
  let showCurrentPassword = $state(false)
  let showNewPassword = $state(false)

  async function handleChangePassword(e: Event) {
    e.preventDefault()
    passwordLoading = true; passwordError = null; passwordSuccess = false
    const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: false })
    if (result.error) {
      passwordError = result.error.message ?? 'Failed to change password.'
    } else {
      passwordSuccess = true
      currentPassword = ''
      newPassword = ''
    }
    passwordLoading = false
  }

  // ─── Cancel Citizenship ───
  let cancelConfirmation = $state('')
  let cancelLoading = $state(false)
  let showCancelSection = $state(false)

  // ─── Delete Account ───
  let deleteConfirmation = $state('')
  let deleteLoading = $state(false)
  let showDeleteSection = $state(false)
  const expectedConfirmation = $derived(user?.username ?? user?.email ?? '')
  const isCitizen = $derived(user?.civicStatus === 'CITIZEN')
  const isCouncilMember = $derived((data.councilMemberships ?? []).length > 0)
  const councilGraceAvailableAt = $derived(
    data.councilGraceAvailableAt
      ? new Date(data.councilGraceAvailableAt).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        })
      : null
  )
  const isCouncilGraceBlocked = $derived(isCouncilMember && !!data.councilGraceAvailableAt)

  $effect(() => {
    if (form?.cancelSuccess) {
      showCancelSection = false
      cancelConfirmation = ''
    }
  })

  function initials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }
</script>

<svelte:head><title>Profile Settings · Gaya OS</title></svelte:head>

<div class="space-y-6">
  {#if !emailVerified}
    <div class="flex items-start gap-3 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
      <TriangleAlert class="mt-0.5 size-4 shrink-0" />
      <div class="flex-1">
        <p class="font-medium">Your email address is not verified.</p>
        <p class="mt-0.5 text-xs opacity-80">Some features may be restricted until you verify your email.</p>
        {#if resendDone}
          <p class="mt-2 text-xs font-medium">Verification email sent — check your inbox.</p>
        {:else}
          <button
            type="button"
            class="mt-2 text-xs font-medium underline underline-offset-2 disabled:opacity-50"
            disabled={resendLoading}
            onclick={handleResendVerification}
          >{resendLoading ? 'Sending…' : 'Resend verification email'}</button>
          {#if resendError}<p class="mt-1 text-xs text-red-600">{resendError}</p>{/if}
        {/if}
      </div>
    </div>
  {/if}

  <div class="grid gap-6 lg:grid-cols-2">

  <!-- Identity + Username -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Identity</Card.Title>
      <Card.Description>Update your name and @username.</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-6">
      <!-- Name -->
      <form onsubmit={handleUpdateName} class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <Label for="firstName">First name</Label>
            <Input id="firstName" type="text" bind:value={firstName} required autocomplete="given-name" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="lastName">Last name</Label>
            <Input id="lastName" type="text" bind:value={lastName} required autocomplete="family-name" />
          </div>
        </div>
        {#if identityError}<p class="text-destructive text-sm">{identityError}</p>{/if}
        {#if identitySuccess}<p class="text-sm text-green-600">Name updated.</p>{/if}
        <Button type="submit" disabled={identityLoading} class="self-start">
          {identityLoading ? 'Saving…' : 'Save name'}
        </Button>
      </form>

      <Separator />

      <!-- Username -->
      <form
        method="POST"
        action="?/changeUsername"
        use:enhance={() => {
          usernameLoading = true
          usernameServerError = null
          usernameSuccess = false
          return async ({ update }) => {
            await update()
            await $session.refetch()
            usernameLoading = false
          }
        }}
        class="flex flex-col gap-4"
      >
        <input type="hidden" name="currentUsername" value={user?.username ?? ''} />
        <div class="flex flex-col gap-1.5">
          <Label for="username">Username</Label>
          <div class="relative">
            <span class="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none">@</span>
            <Input
              id="username"
              name="username"
              type="text"
              bind:value={username}
              oninput={onUsernameInput}
              required
              autocomplete="username"
              disabled={cooldown.onCooldown}
              class="pl-7 pr-8"
            />
            {#if usernameStatus === 'checking'}
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2">
                <LoaderCircle class="text-muted-foreground h-4 w-4 animate-spin" />
              </span>
            {:else if usernameStatus === 'available'}
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2">
                <CircleCheck class="h-4 w-4 text-green-500" />
              </span>
            {:else if usernameStatus === 'taken' || usernameStatus === 'blacklisted' || usernameStatus === 'invalid'}
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2">
                <CircleX class="text-destructive h-4 w-4" />
              </span>
            {/if}
          </div>
          {#if cooldown.onCooldown && cooldownDate}
            <p class="text-muted-foreground text-xs">You need to wait until {cooldownDate} before you can change your username again.</p>
          {:else if usernameStatus === 'taken'}
            <p class="text-destructive text-xs">This username is already taken.</p>
          {:else if usernameStatus === 'blacklisted'}
            <p class="text-destructive text-xs">This username is not allowed{usernameBlacklistReason ? `: ${usernameBlacklistReason}` : ''}.</p>
          {:else if usernameStatus === 'invalid'}
            <p class="text-destructive text-xs">3–30 characters, letters, numbers, underscores and dots only.</p>
          {/if}
        </div>
        {#if usernameServerError}<p class="text-destructive text-sm">{usernameServerError}</p>{/if}
        {#if usernameSuccess}<p class="text-sm text-green-600">Username updated.</p>{/if}
        <Button
          type="submit"
          disabled={usernameLoading || cooldown.onCooldown || usernameStatus === 'taken' || usernameStatus === 'blacklisted'}
          class="self-start"
        >
          {usernameLoading ? 'Saving…' : 'Save username'}
        </Button>
      </form>
    </Card.Content>
  </Card.Root>


  <!-- Password -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Change Password</Card.Title>
      <Card.Description>Set a new password for your account.</Card.Description>
    </Card.Header>
    <Card.Content>
      <form onsubmit={handleChangePassword} class="flex flex-col gap-4">
        <input type="text" autocomplete="username" aria-hidden="true" tabindex="-1" style="display:none" value={user?.username ?? user?.email ?? ''} />
        <div class="flex flex-col gap-1.5">
          <Label for="current-password">Current password</Label>
          <div class="relative">
            <Input id="current-password" type={showCurrentPassword ? 'text' : 'password'} bind:value={currentPassword} required autocomplete="current-password" class="pr-10" />
            <Button type="button" variant="ghost" size="icon" class="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2" onclick={() => (showCurrentPassword = !showCurrentPassword)} tabindex={-1}>
              {#if showCurrentPassword}<EyeOff class="h-4 w-4" />{:else}<Eye class="h-4 w-4" />{/if}
            </Button>
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="new-password">New password</Label>
          <div class="relative">
            <Input id="new-password" type={showNewPassword ? 'text' : 'password'} bind:value={newPassword} required minlength={8} autocomplete="new-password" class="pr-10" />
            <Button type="button" variant="ghost" size="icon" class="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2" onclick={() => (showNewPassword = !showNewPassword)} tabindex={-1}>
              {#if showNewPassword}<EyeOff class="h-4 w-4" />{:else}<Eye class="h-4 w-4" />{/if}
            </Button>
          </div>
        </div>
        {#if passwordError}<p class="text-destructive text-sm">{passwordError}</p>{/if}
        {#if passwordSuccess}<p class="text-sm text-green-600">Password changed.</p>{/if}
        <Button type="submit" disabled={passwordLoading} class="self-start">
          {passwordLoading ? 'Changing…' : 'Change password'}
        </Button>
      </form>
    </Card.Content>
  </Card.Root>

  </div>

  <!-- Step 1: Cancel Citizenship (Citizens only) -->
  {#if isCitizen}
  <Card.Root class="border-destructive/40">
    <Card.Header>
      <Card.Title class="text-destructive">Cancel Citizenship</Card.Title>
      <Card.Description>
        Give up your civic status and return to Visitor. Required before you can delete your account.
        Your proposals, votes, and comments will be preserved.
      </Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      {#if isCouncilGraceBlocked}
        <div class="flex items-start gap-3 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
          <TriangleAlert class="mt-0.5 size-4 shrink-0" />
          <p>
            You are a council member in <strong>{data.councilMemberships.join(', ')}</strong>.
            To allow a successor to be elected, you can cancel your citizenship from
            <strong>{councilGraceAvailableAt}</strong> onward ({data.councilGracePeriodDays}-day grace period).
          </p>
        </div>
      {:else if isCouncilMember}
        <div class="flex items-start gap-3 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
          <TriangleAlert class="mt-0.5 size-4 shrink-0" />
          <p>You are a council member in <strong>{data.councilMemberships.join(', ')}</strong>. The grace period has elapsed — you may now cancel your citizenship.</p>
        </div>
      {/if}

      {#if form?.cancelSuccess}
        <p class="text-sm text-green-600">Your citizenship has been cancelled. You are now a Visitor.</p>
      {:else if !showCancelSection}
        <Button
          variant="outline"
          class="border-destructive/50 text-destructive hover:bg-destructive/10"
          onclick={() => (showCancelSection = true)}
          disabled={isCouncilGraceBlocked}
        >
          Cancel my citizenship
        </Button>
      {:else}
        <form
          method="POST"
          action="?/cancelCitizenship"
          use:enhance={() => {
            cancelLoading = true
            return async ({ update }) => { await update(); cancelLoading = false }
          }}
          class="flex flex-col gap-4"
        >
          <p class="text-muted-foreground text-sm">
            This will remove your Citizen ID and revoke your right to vote, delegate, and submit proposals.
            All your past contributions remain visible.
          </p>
          <div class="flex flex-col gap-1.5">
            <Label for="cancelConfirmation">
              To confirm, type your username or email: <code class="font-mono text-xs">{expectedConfirmation}</code>
            </Label>
            <Input
              id="cancelConfirmation"
              name="confirmation"
              type="text"
              bind:value={cancelConfirmation}
              placeholder={expectedConfirmation}
              autocomplete="off"
            />
          </div>
          {#if form?.cancelError}
            <p class="text-destructive text-sm">{form.cancelError}</p>
          {/if}
          <div class="flex gap-3">
            <Button
              type="submit"
              variant="destructive"
              disabled={cancelLoading || cancelConfirmation !== expectedConfirmation || isCouncilGraceBlocked}
            >
              {cancelLoading ? 'Cancelling…' : 'Cancel my citizenship'}
            </Button>
            <Button type="button" variant="outline" onclick={() => { showCancelSection = false; cancelConfirmation = '' }}>
              Keep my citizenship
            </Button>
          </div>
        </form>
      {/if}
    </Card.Content>
  </Card.Root>
  {/if}

  <!-- Step 2: Delete Account -->
  <Card.Root class="border-destructive/40">
    <Card.Header>
      <Card.Title class="text-destructive">Delete Account</Card.Title>
      <Card.Description>
        Permanently remove your login credentials. Your username, posts, votes, and comments will be preserved under "Former Member".
        {#if isCitizen}You must cancel your citizenship first.{/if}
      </Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      {#if isCitizen}
        <div class="flex items-start gap-3 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
          <TriangleAlert class="mt-0.5 size-4 shrink-0" />
          <p>You need to cancel your citizenship above before you can delete your account.</p>
        </div>
      {/if}

      {#if !showDeleteSection}
        <Button variant="destructive" onclick={() => (showDeleteSection = true)} disabled={isCitizen}>
          Delete my account
        </Button>
      {:else}
        <form
          method="POST"
          action="?/deleteAccount"
          use:enhance={() => {
            deleteLoading = true
            return async ({ update }) => { await update(); deleteLoading = false }
          }}
          class="flex flex-col gap-4"
        >
          <div class="flex flex-col gap-1.5">
            <Label for="deleteConfirmation">
              To confirm, type your username or email: <code class="font-mono text-xs">{expectedConfirmation}</code>
            </Label>
            <Input
              id="deleteConfirmation"
              name="confirmation"
              type="text"
              bind:value={deleteConfirmation}
              placeholder={expectedConfirmation}
              autocomplete="off"
            />
          </div>
          {#if form?.deleteError}
            <p class="text-destructive text-sm">{form.deleteError}</p>
          {/if}
          <div class="flex gap-3">
            <Button
              type="submit"
              variant="destructive"
              disabled={deleteLoading || deleteConfirmation !== expectedConfirmation || isCitizen}
            >
              {deleteLoading ? 'Deleting…' : 'Delete my account permanently'}
            </Button>
            <Button type="button" variant="outline" onclick={() => { showDeleteSection = false; deleteConfirmation = '' }}>
              Cancel
            </Button>
          </div>
        </form>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
