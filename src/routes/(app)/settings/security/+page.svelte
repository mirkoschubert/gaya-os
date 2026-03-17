<script lang="ts">
  import { authClient } from '$lib/auth-client'
  import * as Card from '$lib/components/ui/card'
  import * as Dialog from '$lib/components/ui/dialog'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Separator } from '$lib/components/ui/separator'

  // Passkeys
  const passkeysStore = authClient.useListPasskeys()

  let passkeyName = $state('')
  let addingPasskey = $state(false)
  let passkeyError = $state<string | null>(null)
  let passkeySuccess = $state(false)

  async function handleAddPasskey(e: Event) {
    e.preventDefault()
    addingPasskey = true
    passkeyError = null
    passkeySuccess = false

    const result = await authClient.passkey.addPasskey({
      name: passkeyName || undefined
    })

    if (result?.error) {
      passkeyError = result.error.message ?? 'Failed to register passkey.'
    } else {
      passkeySuccess = true
      passkeyName = ''
    }
    addingPasskey = false
  }

  let pendingDeletePasskey = $state<{ id: string; name: string } | null>(null)
  let deletingPasskey = $state(false)

  async function confirmDeletePasskey() {
    if (!pendingDeletePasskey) return
    deletingPasskey = true
    await authClient.$fetch('/passkey/delete-passkey', {
      method: 'POST',
      body: { id: pendingDeletePasskey.id }
    })
    await $passkeysStore.refetch()
    pendingDeletePasskey = null
    deletingPasskey = false
  }

  // Sessions
  let sessions = $state<{ id: string; userAgent?: string | null; createdAt: Date }[]>([])
  let sessionsLoading = $state(true)

  async function loadSessions() {
    const result = await authClient.listSessions()
    if (result.data) sessions = result.data
    sessionsLoading = false
  }

  async function handleRevokeOthers() {
    await authClient.revokeOtherSessions()
    loadSessions()
  }

  $effect(() => {
    loadSessions()
  })
</script>

<svelte:head><title>Security & Privacy · Gaya OS</title></svelte:head>

<Dialog.Root
  open={!!pendingDeletePasskey}
  onOpenChange={(open) => { if (!open) pendingDeletePasskey = null }}
>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Remove passkey?</Dialog.Title>
      <Dialog.Description>
        <strong>{pendingDeletePasskey?.name ?? 'This passkey'}</strong> will be permanently removed.
        You will no longer be able to sign in with it.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (pendingDeletePasskey = null)}>Cancel</Button>
      <Button variant="destructive" disabled={deletingPasskey} onclick={confirmDeletePasskey}>
        {deletingPasskey ? 'Removing…' : 'Remove'}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<div class="grid gap-6 lg:grid-cols-2">
  <Card.Root>
    <Card.Header>
      <Card.Title>Passkeys</Card.Title>
      <Card.Description>
        Register a passkey (hardware key, Face ID, Touch ID, etc.) for passwordless sign-in.
      </Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      {#if $passkeysStore?.data && $passkeysStore.data.length > 0}
        <ul class="space-y-2">
          {#each $passkeysStore.data as pk}
            <li class="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <div>
                <p class="font-medium">{pk.name ?? 'Unnamed key'}</p>
                <p class="text-muted-foreground text-xs">
                  Added {new Date(pk.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                class="text-destructive hover:text-destructive"
                onclick={() => (pendingDeletePasskey = { id: pk.id, name: pk.name ?? 'Unnamed key' })}
              >
                Remove
              </Button>
            </li>
          {/each}
        </ul>
        <Separator />
      {/if}

      <form onsubmit={handleAddPasskey} class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <Label for="passkey-name">Passkey name (optional)</Label>
          <Input
            id="passkey-name"
            type="text"
            placeholder="e.g. YubiKey 5, MacBook Touch ID"
            bind:value={passkeyName}
          />
        </div>
        {#if passkeyError}
          <p class="text-destructive text-sm">{passkeyError}</p>
        {/if}
        {#if passkeySuccess}
          <p class="text-sm text-green-600">Passkey registered successfully.</p>
        {/if}
        <Button type="submit" disabled={addingPasskey} class="self-start">
          {addingPasskey ? 'Registering…' : 'Add passkey'}
        </Button>
      </form>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Active Sessions</Card.Title>
      <Card.Description>All devices currently signed in to your account.</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      {#if sessionsLoading}
        <p class="text-muted-foreground text-sm">Loading sessions…</p>
      {:else if sessions.length === 0}
        <p class="text-muted-foreground text-sm">No active sessions found.</p>
      {:else}
        <ul class="space-y-2">
          {#each sessions as s}
            <li class="rounded-md border px-3 py-2 text-sm">
              <p class="truncate font-medium">{s.userAgent ?? 'Unknown device'}</p>
              <p class="text-muted-foreground text-xs">
                Since {new Date(s.createdAt).toLocaleDateString()}
              </p>
            </li>
          {/each}
        </ul>
        <Button variant="outline" onclick={handleRevokeOthers} class="self-start">
          Sign out all other sessions
        </Button>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
