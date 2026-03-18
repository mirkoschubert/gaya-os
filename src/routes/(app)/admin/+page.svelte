<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Users, FileText, Scale, ShieldCheck } from '@lucide/svelte'
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
        View, moderate, and manage all registered accounts. Review citizenship applications, flags, and role assignments.
      </p>
      <Button href="/admin/users" size="sm">Manage users</Button>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
      <Card.Title class="text-sm font-medium">Governance Settings</Card.Title>
      <Scale class="text-muted-foreground size-4" />
    </Card.Header>
    <Card.Content>
      <p class="text-muted-foreground mb-4 text-sm">
        Configure voting thresholds, council rules, citizenship requirements, username policies, and engagement points.
      </p>
      <Button href="/admin/governance" size="sm">Configure governance</Button>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
      <Card.Title class="text-sm font-medium">Documents</Card.Title>
      <FileText class="text-muted-foreground size-4" />
    </Card.Header>
    <Card.Content>
      <p class="text-muted-foreground mb-4 text-sm">
        Manage the constitution, policies, and other official documents. Publish new versions and review history.
      </p>
      <Button href="/admin/documents" size="sm">Manage documents</Button>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
      <Card.Title class="text-sm font-medium">Roles & Permissions</Card.Title>
      <ShieldCheck class="text-muted-foreground size-4" />
    </Card.Header>
    <Card.Content>
      <p class="text-muted-foreground mb-4 text-sm">
        Review and adjust the capability matrix for each role — what Visitors, Citizens, Council Members, Moderators, and Admins can do.
      </p>
      <Button href="/admin/roles" size="sm">Manage roles</Button>
    </Card.Content>
  </Card.Root>
</div>
