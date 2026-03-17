<script lang="ts">
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import * as Card from '$lib/components/ui/card'
  import * as Table from '$lib/components/ui/table'
  import * as Dialog from '$lib/components/ui/dialog'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { MoreHorizontal } from '@lucide/svelte'

  let { data, form } = $props()

  // Delete confirmation modal
  let pendingDelete = $state<{ id: string; email: string } | null>(null)

  function roleBadgeVariant(role: string) {
    if (role === 'ADMIN') return 'destructive'
    if (role === 'MODERATOR') return 'secondary'
    return 'outline'
  }

  function civicBadgeVariant(status: string) {
    return status === 'CITIZEN' ? 'default' : 'outline'
  }

  function formatDate(d: Date | string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('de-DE', { dateStyle: 'medium' })
  }

  const reloadAfter: SubmitFunction = () => {
    return async ({ update }) => {
      await update({ reset: false })
    }
  }

  const submitDelete: SubmitFunction = () => {
    return async ({ update }) => {
      pendingDelete = null
      await update({ reset: false })
    }
  }
</script>

<svelte:head><title>Users · Admin · Gaya OS</title></svelte:head>

<!-- Delete confirmation dialog -->
<Dialog.Root open={!!pendingDelete} onOpenChange={(open) => { if (!open) pendingDelete = null }}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete user?</Dialog.Title>
      <Dialog.Description>
        This will permanently delete <strong>{pendingDelete?.email}</strong> including all their
        sessions and data. This cannot be undone.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (pendingDelete = null)}>Cancel</Button>
      <form method="POST" action="?/deleteUser" use:enhance={submitDelete}>
        <input type="hidden" name="userId" value={pendingDelete?.id} />
        <Button type="submit" variant="destructive">Delete</Button>
      </form>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<div class="space-y-4">
  <div>
    <h1 class="text-xl font-semibold">Users</h1>
    <p class="text-muted-foreground text-sm">{data.users.length} registered accounts</p>
  </div>

  {#if form?.message}
    <p class="text-destructive text-sm">{form.message}</p>
  {:else if form?.success}
    {#if (form as { migratedCount?: number }).migratedCount !== undefined}
      <p class="text-sm text-green-600">
        Migrated {(form as { migratedCount: number }).migratedCount} citizen ID(s) to the new format.
      </p>
    {:else}
      <p class="text-sm text-green-600">Done.</p>
    {/if}
  {/if}

  <form method="POST" action="?/migrateCitizenIds" use:enhance={reloadAfter}>
    <Button type="submit" variant="outline" size="sm">
      Migrate old citizen IDs
    </Button>
  </form>

  <Card.Root>
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Email</Table.Head>
          <Table.Head>Username</Table.Head>
          <Table.Head>Role</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Verified</Table.Head>
          <Table.Head>Joined</Table.Head>
          <Table.Head>Last Login</Table.Head>
          <Table.Head class="w-10"></Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each data.users as user}
          <Table.Row>
            <Table.Cell class="font-medium">
              {user.firstName || user.lastName
                ? `${user.firstName} ${user.lastName}`.trim()
                : user.name || '—'}
            </Table.Cell>
            <Table.Cell class="text-muted-foreground text-sm">{user.email}</Table.Cell>
            <Table.Cell class="text-muted-foreground text-sm">
              {user.username ? `@${user.username}` : '—'}
            </Table.Cell>
            <Table.Cell>
              <Badge variant={roleBadgeVariant(user.role)}>{user.role}</Badge>
            </Table.Cell>
            <Table.Cell>
              <Badge variant={civicBadgeVariant(user.civicStatus)}>{user.civicStatus}</Badge>
            </Table.Cell>
            <Table.Cell>
              {#if user.emailVerified}
                <span class="text-sm text-green-600">✓</span>
              {:else}
                <span class="text-muted-foreground text-sm">✗</span>
              {/if}
            </Table.Cell>
            <Table.Cell class="text-muted-foreground text-sm">
              {formatDate(user.createdAt)}
            </Table.Cell>
            <Table.Cell class="text-muted-foreground text-sm">
              {formatDate(user.lastLogin)}
            </Table.Cell>
            <Table.Cell>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  {#snippet child({ props })}
                    <Button variant="ghost" size="icon" {...props}>
                      <MoreHorizontal class="size-4" />
                      <span class="sr-only">Actions</span>
                    </Button>
                  {/snippet}
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger>Set role</DropdownMenu.SubTrigger>
                    <DropdownMenu.SubContent>
                      {#each ['USER', 'MODERATOR', 'ADMIN'] as role}
                        <DropdownMenu.Item>
                          <form method="POST" action="?/setRole" use:enhance={reloadAfter}>
                            <input type="hidden" name="userId" value={user.id} />
                            <input type="hidden" name="role" value={role} />
                            <button
                              type="submit"
                              class="flex w-full items-center gap-2 disabled:opacity-50"
                              disabled={user.role === role}
                            >
                              {role}
                              {#if user.role === role}
                                <span class="text-muted-foreground text-xs">(current)</span>
                              {/if}
                            </button>
                          </form>
                        </DropdownMenu.Item>
                      {/each}
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Sub>

                  <DropdownMenu.Separator />

                  {#if !user.emailVerified}
                    <DropdownMenu.Item>
                      <form method="POST" action="?/verifyEmail" use:enhance={reloadAfter}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button type="submit" class="flex w-full">Mark email verified</button>
                      </form>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item>
                      <form
                        method="POST"
                        action="?/resendVerification"
                        use:enhance={reloadAfter}
                      >
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="email" value={user.email} />
                        <button type="submit" class="flex w-full flex-col items-start">
                          <span>Resend verification email</span>
                          <span class="text-muted-foreground text-xs"
                            >Requires verified Resend domain</span
                          >
                        </button>
                      </form>
                    </DropdownMenu.Item>
                  {/if}

                  <DropdownMenu.Separator />

                  <DropdownMenu.Item>
                    <button
                      type="button"
                      class="text-destructive flex w-full"
                      onclick={() => (pendingDelete = { id: user.id, email: user.email })}
                    >
                      Delete user
                    </button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </Card.Root>
</div>
