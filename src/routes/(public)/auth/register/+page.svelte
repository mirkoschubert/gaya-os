<script lang="ts">
  import { signUp } from '$lib/auth-client'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'

  let firstName = $state('')
  let lastName = $state('')
  let username = $state('')
  let email = $state('')
  let password = $state('')
  let error = $state<string | null>(null)
  let loading = $state(false)
  let emailSent = $state(false)
  let sentTo = $state('')

  async function handleSubmit(e: Event) {
    e.preventDefault()
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
              required
              autocomplete="username"
              class="pl-7"
            />
          </div>
          <p class="text-muted-foreground text-xs">
            Letters, numbers, underscores and dots only.
          </p>
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
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            bind:value={password}
            required
            minlength={8}
            autocomplete="new-password"
          />
        </div>
        {#if error}
          <p class="text-destructive text-sm">{error}</p>
        {/if}
        <Button type="submit" disabled={loading} class="w-full">
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
