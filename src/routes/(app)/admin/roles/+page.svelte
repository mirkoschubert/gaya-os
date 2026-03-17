<script lang="ts">
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import * as Card from '$lib/components/ui/card'
  import * as Table from '$lib/components/ui/table'
  import { Badge } from '$lib/components/ui/badge'
  import { Switch } from '$lib/components/ui/switch'
  import { CAPABILITY_GROUPS, ROLES } from '$lib/domain/roles'

  let { data, form } = $props()

  let matrix = $state<typeof data.matrix>({})

  $effect(() => {
    matrix = data.matrix
  })

  const reloadAfter: SubmitFunction = () => {
    return async ({ update }) => {
      await update({ reset: false })
    }
  }

  function onToggle(role: string, capability: string, checked: boolean) {
    matrix = {
      ...matrix,
      [role]: {
        ...matrix[role],
        [capability]: checked
      }
    }
  }
</script>

<svelte:head><title>Roles & Permissions · Admin · Gaya OS</title></svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-xl font-semibold">Roles & Permissions</h1>
    <p class="text-muted-foreground text-sm">
      Configure which capabilities each role has. Changes take effect immediately and are logged in
      the activity feed.
    </p>
  </div>

  {#if form?.message}
    <p class="text-destructive text-sm">{form.message}</p>
  {/if}

  <Card.Root>
    <Card.Header>
      <Card.Title>Permission Matrix</Card.Title>
      <Card.Description>
        Capabilities are merged across two dimensions: <strong>CivicStatus</strong> (VISITOR,
        CITIZEN) and <strong>UserRole</strong> (MODERATOR, ADMIN). A user receives the union of
        both rows — so a CITIZEN/MODERATOR gets all CITIZEN rights plus the MODERATOR extras.
        USER is a default placeholder role with no own capabilities.
      </Card.Description>
    </Card.Header>
    <div class="overflow-x-auto">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="min-w-48">Capability</Table.Head>
            {#each ROLES as role}
              <Table.Head class="text-center">
                <Badge variant={role === 'ADMIN' ? 'destructive' : role === 'MODERATOR' ? 'secondary' : 'outline'}>
                  {role}
                </Badge>
              </Table.Head>
            {/each}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each CAPABILITY_GROUPS as group}
            <Table.Row class="bg-muted/40 hover:bg-muted/40">
              <Table.Cell
                colspan={ROLES.length + 1}
                class="text-muted-foreground py-2 text-xs font-semibold uppercase tracking-wide"
              >
                {group.label}
              </Table.Cell>
            </Table.Row>
            {#each group.capabilities as cap}
              <Table.Row>
                <Table.Cell class="font-medium">{cap.label}</Table.Cell>
                {#each ROLES as role}
                  <Table.Cell class="text-center">
                    <form
                      method="POST"
                      action="?/toggleCapability"
                      use:enhance={reloadAfter}
                      class="flex justify-center"
                    >
                      <input type="hidden" name="role" value={role} />
                      <input type="hidden" name="capability" value={cap.key} />
                      <input type="hidden" name="allowed" value={!matrix[role]?.[cap.key]} />
                      <Switch
                        checked={matrix[role]?.[cap.key] ?? false}
                        onCheckedChange={(checked) => {
                          onToggle(role, cap.key, checked)
                        }}
                        onclick={(e) => {
                          ;(e.currentTarget as HTMLElement).closest('form')?.requestSubmit()
                        }}
                        aria-label={`${role} ${cap.key}`}
                      />
                    </form>
                  </Table.Cell>
                {/each}
              </Table.Row>
            {/each}
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  </Card.Root>
</div>
