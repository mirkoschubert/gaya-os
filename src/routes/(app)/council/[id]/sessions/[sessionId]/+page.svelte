<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const session = $derived(data.session)

  const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    SCHEDULED: 'outline',
    IN_PROGRESS: 'default',
    COMPLETED: 'secondary',
    CANCELLED: 'destructive'
  }

  const itemStatusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    OPEN: 'outline',
    IN_DISCUSSION: 'default',
    RESOLVED: 'secondary',
    DEFERRED: 'destructive'
  }
</script>

<div class="space-y-6">
  <div class="flex items-start justify-between gap-4">
    <div>
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold">{session.title}</h1>
        <Badge variant={statusVariant[session.status] ?? 'outline'}>{session.status}</Badge>
      </div>
      {#if session.description}
        <p class="mt-1 text-sm text-muted-foreground">{session.description}</p>
      {/if}
      <p class="mt-1 text-sm text-muted-foreground">
        {session.scheduledAt.toLocaleString()}
        {#if session.endsAt}
          &ndash; {session.endsAt.toLocaleString()}
        {/if}
      </p>
      {#if session.location}
        <p class="mt-1 text-sm">{session.location}</p>
      {/if}
    </div>
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title>Agenda ({session.agendaItems.length})</Card.Title>
    </Card.Header>
    <Card.Content>
      {#if session.agendaItems.length === 0}
        <p class="text-sm text-muted-foreground">No agenda items yet.</p>
      {:else}
        <ol class="space-y-4">
          {#each session.agendaItems as item}
            <li class="flex items-start gap-3">
              <span class="text-sm text-muted-foreground w-5 shrink-0">{item.order + 1}.</span>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-sm">{item.title}</span>
                  <Badge variant={itemStatusVariant[item.status] ?? 'outline'} class="text-xs">
                    {item.status}
                  </Badge>
                </div>
                {#if item.description}
                  <p class="text-sm text-muted-foreground mt-1">{item.description}</p>
                {/if}
                {#if item.proposalId}
                  <a
                    href="/proposals/{item.proposalId}"
                    class="text-xs text-primary hover:underline mt-1 block"
                  >
                    Proposal: {item.proposalTitle ?? item.proposalId}
                  </a>
                {/if}
                {#if item.outcome}
                  <p class="text-sm mt-2 p-2 bg-muted rounded">{item.outcome}</p>
                {/if}
              </div>
            </li>
          {/each}
        </ol>
      {/if}
    </Card.Content>
  </Card.Root>

  {#if session.notes}
    <Card.Root>
      <Card.Header>
        <Card.Title>Notes</Card.Title>
      </Card.Header>
      <Card.Content>
        <p class="text-sm whitespace-pre-line">{session.notes}</p>
      </Card.Content>
    </Card.Root>
  {/if}
</div>
