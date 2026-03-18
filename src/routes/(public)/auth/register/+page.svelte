<script lang="ts">
  import { signUp } from '$lib/auth-client'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Eye, EyeOff, CircleCheck, CircleX, LoaderCircle } from '@lucide/svelte'

  let firstName = $state('')
  let lastName = $state('')
  let username = $state('')
  let email = $state('')
  let password = $state('')
  let confirmPassword = $state('')
  let error = $state<string | null>(null)
  let loading = $state(false)
  let emailSent = $state(false)
  let sentTo = $state('')
  let showPassword = $state(false)
  let showConfirm = $state(false)

  // Username availability check state
  type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'blacklisted' | 'invalid'
  let usernameStatus = $state<UsernameStatus>('idle')
  let usernameBlacklistReason = $state<string | null>(null)
  let usernameDebounceTimer: ReturnType<typeof setTimeout> | null = null

  function onUsernameInput() {
    usernameStatus = 'idle'
    usernameBlacklistReason = null
    if (usernameDebounceTimer) clearTimeout(usernameDebounceTimer)
    if (!username || username.length < 3) return
    usernameStatus = 'checking'
    usernameDebounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/username/check?username=${encodeURIComponent(username)}`)
        const data = await res.json()
        if (data.reason === 'invalid') usernameStatus = 'invalid'
        else if (data.available) usernameStatus = 'available'
        else if (data.reason === 'blacklisted') {
          usernameStatus = 'blacklisted'
          usernameBlacklistReason = data.blacklistReason ?? null
        } else usernameStatus = 'taken'
      } catch {
        usernameStatus = 'idle'
      }
    }, 300)
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    if (password !== confirmPassword) {
      error = 'Passwords do not match.'
      return
    }
    if (usernameStatus === 'taken') {
      error = 'This username is already taken.'
      return
    }
    if (usernameStatus === 'blacklisted') {
      error = 'This username is not allowed.'
      return
    }
    loading = true
    error = null

    const result = await signUp.email({
      name: `${firstName} ${lastName}`.trim(),
      email,
      password,
      firstName,
      lastName,
      username
    } as Parameters<typeof signUp.email>[0])

    if (result.error) {
      error = result.error.message ?? 'Registration failed. Please try again.'
    } else {
      sentTo = email
      emailSent = true
    }

    loading = false
  }
</script>

{#if emailSent}
  <Card.Root>
    <Card.Header>
      <Card.Title class="text-2xl">Check your inbox</Card.Title>
      <Card.Description>
        We sent a verification link to <strong>{sentTo}</strong>. Click the link
        in the email to activate your account.
      </Card.Description>
    </Card.Header>
    <Card.Footer class="justify-center text-sm">
      Already verified?&nbsp;<a href="/auth/login" class="underline">Sign in</a>
    </Card.Footer>
  </Card.Root>
{:else}
  <Card.Root>
    <Card.Header>
      <Card.Title class="text-2xl">Create an account</Card.Title>
      <Card.Description>
        Join the micro-nation as a Visitor. You can apply for citizenship later.
      </Card.Description>
    </Card.Header>
    <Card.Content>
      <form onsubmit={handleSubmit} class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <Label for="firstName">First name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Ada"
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
              placeholder="Lovelace"
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
              placeholder="your_handle"
              bind:value={username}
              oninput={onUsernameInput}
              required
              autocomplete="username"
              class="pl-7 pr-8"
            />
            {#if usernameStatus === 'checking'}
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2">
                <LoaderCircle class="text-muted-foreground h-4 w-4 animate-spin" />
              </span>
            {:else if usernameStatus === 'available'}
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2">
                <CircleCheck class="text-green-500 h-4 w-4" />
              </span>
            {:else if usernameStatus === 'taken' || usernameStatus === 'blacklisted' || usernameStatus === 'invalid'}
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2">
                <CircleX class="text-destructive h-4 w-4" />
              </span>
            {/if}
          </div>
          {#if usernameStatus === 'taken'}
            <p class="text-destructive text-xs">This username is already taken.</p>
          {:else if usernameStatus === 'blacklisted'}
            <p class="text-destructive text-xs">This username is not allowed{usernameBlacklistReason ? `: ${usernameBlacklistReason}` : ''}.</p>
          {:else if usernameStatus === 'invalid'}
            <p class="text-destructive text-xs">3–30 characters, letters, numbers, underscores and dots only.</p>
          {:else}
            <p class="text-muted-foreground text-xs">
              Letters, numbers, underscores and dots only.
            </p>
          {/if}
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            bind:value={email}
            required
            autocomplete="email"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="password">Password</Label>
          <div class="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              bind:value={password}
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
              {#if showPassword}
                <EyeOff class="h-4 w-4" />
              {:else}
                <Eye class="h-4 w-4" />
              {/if}
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
              {#if showConfirm}
                <EyeOff class="h-4 w-4" />
              {:else}
                <Eye class="h-4 w-4" />
              {/if}
            </Button>
          </div>
          {#if confirmPassword && password !== confirmPassword}
            <p class="text-destructive text-xs">Passwords do not match.</p>
          {/if}
        </div>
        {#if error}
          <p class="text-destructive text-sm">{error}</p>
        {/if}
        <Button
          type="submit"
          disabled={loading || usernameStatus === 'taken' || usernameStatus === 'blacklisted'}
          class="w-full"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </Card.Content>
    <Card.Footer class="justify-center text-sm">
      Already have an account?&nbsp;<a href="/auth/login" class="underline"
        >Sign in</a
      >
    </Card.Footer>
  </Card.Root>
{/if}
