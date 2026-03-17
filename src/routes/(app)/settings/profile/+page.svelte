<script lang="ts">
  import { authClient, useSession } from '$lib/auth-client'
  import { page } from '$app/state'
  import type { AppUser, ProfileLink } from '$lib/domain/auth'
  import * as Card from '$lib/components/ui/card'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as Switch from '$lib/components/ui/switch'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Textarea } from '$lib/components/ui/textarea'
  import { TriangleAlert, Plus, Trash2, Upload } from '@lucide/svelte'

  const session = useSession()

  const user = $derived($session.data?.user as AppUser | undefined)
  const caps = $derived((page.data as { caps?: Record<string, boolean> }).caps ?? {})
  const canEditProfile = $derived(caps['can_edit_own_profile'] ?? false)
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

  // ─── Identity ───
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
      identityError = `${result.error.status ?? ''} ${result.error.message ?? 'Failed to update profile.'}`.trim()
    } else {
      identitySuccess = true
    }
    identityLoading = false
  }

  // ─── Profile Info ───
  let bio = $state('')
  let location = $state('')
  let links = $state<ProfileLink[]>([])
  let showRealName = $state(true)
  let profileLoading = $state(false)
  let profileError = $state<string | null>(null)
  let profileSuccess = $state(false)

  function parseLinks(raw: unknown): ProfileLink[] {
    if (!raw) return []
    if (Array.isArray(raw)) return raw as ProfileLink[]
    if (typeof raw === 'string') {
      try { return JSON.parse(raw) } catch { return [] }
    }
    return []
  }

  $effect(() => {
    if (user) {
      bio = user.bio ?? ''
      location = user.location ?? ''
      links = parseLinks(user.links)
      showRealName = user.showRealName ?? true
    }
  })

  function addLink() {
    links = [...links, { label: '', url: '' }]
  }

  function removeLink(index: number) {
    links = links.filter((_, i) => i !== index)
  }

  async function handleUpdateProfile(e: Event) {
    e.preventDefault()
    profileLoading = true
    profileError = null
    profileSuccess = false

    const validLinks = links.filter((l) => l.label.trim() && l.url.trim())

    const result = await authClient.updateUser({
      bio: bio || null,
      location: location || null,
      links: JSON.stringify(validLinks),
      showRealName
    } as Parameters<typeof authClient.updateUser>[0])

    if (result.error) {
      profileError = result.error.message ?? 'Failed to update profile info.'
    } else {
      profileSuccess = true
    }
    profileLoading = false
  }

  // ─── Avatar upload ───
  let avatarLoading = $state(false)
  let avatarError = $state<string | null>(null)
  let avatarSuccess = $state(false)
  let avatarInput: HTMLInputElement | undefined = $state()
  let localAvatarUrl = $state<string | null>(null)

  $effect(() => {
    if (user?.avatarUrl) localAvatarUrl = user.avatarUrl
  })

  async function handleAvatarUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    avatarLoading = true
    avatarError = null
    avatarSuccess = false

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload/avatar', { method: 'POST', body: formData })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      avatarError = data.error ?? 'Upload failed.'
    } else {
      const data = await res.json()
      localAvatarUrl = data.url
      avatarSuccess = true
      await $session.refetch()
    }
    avatarLoading = false
  }

  // ─── Hero upload ───
  let heroLoading = $state(false)
  let heroError = $state<string | null>(null)
  let heroSuccess = $state(false)
  let heroInput: HTMLInputElement | undefined = $state()
  let localHeroUrl = $state<string | null>(null)

  $effect(() => {
    if (user?.heroUrl) localHeroUrl = user.heroUrl
  })

  async function handleHeroUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    heroLoading = true
    heroError = null
    heroSuccess = false

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload/hero', { method: 'POST', body: formData })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      heroError = data.error ?? 'Upload failed.'
    } else {
      const data = await res.json()
      localHeroUrl = data.url
      heroSuccess = true
      await $session.refetch()
    }
    heroLoading = false
  }

  // ─── Password ───
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

  function initials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
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

  <div class="grid gap-6 lg:grid-cols-2">

  <!-- Identity -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Identity</Card.Title>
      <Card.Description>Update your name and username.</Card.Description>
    </Card.Header>
    <Card.Content>
      <form onsubmit={handleUpdateIdentity} class="flex flex-col gap-4">
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
        <div class="flex flex-col gap-1.5">
          <Label for="username">Username</Label>
          <div class="relative">
            <span class="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none">@</span>
            <Input id="username" type="text" bind:value={username} required autocomplete="username" class="pl-7" />
          </div>
        </div>
        {#if identityError}
          <p class="text-destructive text-sm">{identityError}</p>
        {/if}
        {#if identitySuccess}
          <p class="text-sm text-green-600">Identity updated successfully.</p>
        {/if}
        <Button type="submit" disabled={identityLoading} class="self-start">
          {identityLoading ? 'Saving…' : 'Save identity'}
        </Button>
      </form>
    </Card.Content>
  </Card.Root>

  {#if canEditProfile}
  <!-- Profile Info -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Profile Info</Card.Title>
      <Card.Description>Customize what others see on your public profile.</Card.Description>
    </Card.Header>
    <Card.Content>
      <form onsubmit={handleUpdateProfile} class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <Label for="bio">Bio</Label>
          <Textarea id="bio" placeholder="Tell others a bit about yourself…" bind:value={bio} rows={3} />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="location">Location</Label>
          <Input id="location" type="text" placeholder="e.g. Berlin, Germany" bind:value={location} />
        </div>

        <!-- Links -->
        <div class="flex flex-col gap-2">
          <Label>Links</Label>
          {#each links as link, i}
            <div class="flex gap-2">
              <Input type="text" placeholder="Label" bind:value={link.label} class="w-32 shrink-0" />
              <Input type="url" placeholder="https://…" bind:value={link.url} class="flex-1" />
              <Button type="button" variant="ghost" size="icon" onclick={() => removeLink(i)}>
                <Trash2 class="size-4" />
              </Button>
            </div>
          {/each}
          <Button type="button" variant="outline" size="sm" onclick={addLink} class="self-start">
            <Plus class="size-4" />
            Add link
          </Button>
        </div>

        <!-- Show real name toggle -->
        <div class="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p class="text-sm font-medium">Show real name</p>
            <p class="text-muted-foreground text-xs">Display your first and last name on your profile instead of your username.</p>
          </div>
          <Switch.Root
            id="showRealName"
            checked={showRealName}
            onCheckedChange={(v) => (showRealName = v)}
          />
        </div>

        {#if profileError}
          <p class="text-destructive text-sm">{profileError}</p>
        {/if}
        {#if profileSuccess}
          <p class="text-sm text-green-600">Profile info updated successfully.</p>
        {/if}
        <Button type="submit" disabled={profileLoading} class="self-start">
          {profileLoading ? 'Saving…' : 'Save profile info'}
        </Button>
      </form>
    </Card.Content>
  </Card.Root>

  <!-- Avatar Upload -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Profile Picture</Card.Title>
      <Card.Description>Upload a profile picture. Max 2 MB, JPG/PNG/WebP.</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="flex items-center gap-4">
        <Avatar.Root class="size-16">
          {#if localAvatarUrl}
            <Avatar.Image src={localAvatarUrl} alt={user?.name} />
          {/if}
          <Avatar.Fallback class="text-lg">{initials(user?.name ?? '?')}</Avatar.Fallback>
        </Avatar.Root>
        <div class="flex flex-col gap-2">
          <input
            bind:this={avatarInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            onchange={handleAvatarUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={avatarLoading}
            onclick={() => avatarInput?.click()}
          >
            <Upload class="size-4" />
            {avatarLoading ? 'Uploading…' : 'Upload picture'}
          </Button>
          {#if avatarError}
            <p class="text-destructive text-xs">{avatarError}</p>
          {/if}
          {#if avatarSuccess}
            <p class="text-xs text-green-600">Picture updated.</p>
          {/if}
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Hero Upload -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Profile Banner</Card.Title>
      <Card.Description>Upload a banner image for your profile page. Max 5 MB, JPG/PNG/WebP.</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="flex flex-col gap-3">
        {#if localHeroUrl}
          <div class="h-24 w-full overflow-hidden rounded-md border">
            <img src={localHeroUrl} alt="Profile banner" class="h-full w-full object-cover" />
          </div>
        {:else}
          <div class="flex h-24 w-full items-center justify-center rounded-md border bg-linear-to-br from-primary/20 to-primary/5">
            <p class="text-muted-foreground text-xs">No banner set</p>
          </div>
        {/if}
        <div>
          <input
            bind:this={heroInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            onchange={handleHeroUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={heroLoading}
            onclick={() => heroInput?.click()}
          >
            <Upload class="size-4" />
            {heroLoading ? 'Uploading…' : 'Upload banner'}
          </Button>
          {#if heroError}
            <p class="text-destructive text-xs">{heroError}</p>
          {/if}
          {#if heroSuccess}
            <p class="text-xs text-green-600">Banner updated.</p>
          {/if}
        </div>
      </div>
    </Card.Content>
  </Card.Root>
  {/if}

  <!-- Password -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Change Password</Card.Title>
      <Card.Description>Set a new password for your account.</Card.Description>
    </Card.Header>
    <Card.Content>
      <form onsubmit={handleChangePassword} class="flex flex-col gap-4">
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
          <Input id="current-password" type="password" bind:value={currentPassword} required autocomplete="current-password" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="new-password">New password</Label>
          <Input id="new-password" type="password" bind:value={newPassword} required minlength={8} autocomplete="new-password" />
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
</div>
