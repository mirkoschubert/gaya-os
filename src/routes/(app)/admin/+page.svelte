<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Users } from '@lucide/svelte'
</script>

<svelte:head><title>Admin · Gaya OS</title></svelte:head>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <Card.Root>
    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
      <Card.Title class="text-sm font-medium">User Management</Card.Title>
      <Users class="text-muted-foreground size-4" />
    </Card.Header>
    <Card.Content>
      <p class="text-muted-foreground mb-4 text-sm">
        View, moderate, and manage all registered accounts.
      </p>
      <Button href="/admin/users" size="sm">Manage users</Button>
    </Card.Content>
  </Card.Root>
</div>
