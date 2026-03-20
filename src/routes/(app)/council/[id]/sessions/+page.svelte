<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Plus } from '@lucide/svelte'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    SCHEDULED: 'outline',
    IN_PROGRESS: 'default',
    COMPLETED: 'secondary',
    CANCELLED: 'destructive'
  }

  const upcoming = $derived(
    data.sessions.filter((s) => s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS')
  )
  const past = $derived(
    data.sessions.filter((s) => s.status === 'COMPLETED' || s.status === 'CANCELLED')
  )
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Sessions</h1>
      <p class="text-muted-foreground">{data.councilName}</p>
    </div>
    <Button size="sm" href="/council/{data.councilId}/sessions/new">
      <Plus class="size-4" />
      New Session
    </Button>
  </div>

  {#if upcoming.length > 0}
    <div class="space-y-3">
      <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Upcoming</h2>
      {#each upcoming as session}
        <Card.Root>
          <Card.Content class="flex items-center justify-between p-4">
            <div>
              <a href="/council/{data.councilId}/sessions/{session.id}" class="font-medium hover:underline">
                {session.title}
              </a>
              {#if session.description}
                <p class="text-sm text-muted-foreground mt-1">{session.description}</p>
              {/if}
              <p class="text-xs text-muted-foreground mt-1">
                {session.scheduledAt.toLocaleString()}
                {#if session.endsAt}
                  &ndash; {session.endsAt.toLocaleString()}
                {/if}
              </p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="text-sm text-muted-foreground">{session.agendaItemCount} items</span>
              <Badge variant={statusVariant[session.status] ?? 'outline'}>{session.status}</Badge>
            </div>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {/if}

  {#if past.length > 0}
    <div class="space-y-3">
      <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Past</h2>
      {#each past as session}
        <Card.Root>
          <Card.Content class="flex items-center justify-between p-4">
            <div>
              <a href="/council/{data.councilId}/sessions/{session.id}" class="font-medium hover:underline">
                {session.title}
              </a>
              <p class="text-xs text-muted-foreground mt-1">
                {session.scheduledAt.toLocaleString()}
              </p>
            </div>
            <Badge variant={statusVariant[session.status] ?? 'outline'}>{session.status}</Badge>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {/if}

  {#if data.sessions.length === 0}
    <p class="text-muted-foreground text-sm">No sessions yet.</p>
  {/if}
</div>
