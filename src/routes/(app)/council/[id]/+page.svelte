<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import * as Avatar from '$lib/components/ui/avatar'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { page } from '$app/state'
  import { CalendarDays, ClipboardList, MessageSquare } from '@lucide/svelte'
  import { messagesCommand } from '$lib/stores/messages'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const council = $derived(data.council)
  const councilMemberships = $derived(
    (page.data as { councilMemberships?: { councilId: string }[] }).councilMemberships ?? []
  )
  const isOwnCouncil = $derived(councilMemberships.some((m) => m.councilId === council.id))

  const typeLabels: Record<string, string> = {
    NATIONAL: 'National Council',
    REGIONAL: 'Regional Council',
    THEMATIC: 'Thematic Council'
  }

  async function openCouncilChat() {
    const res = await fetch(`/api/messages/council/${council.id}`, { method: 'POST' })
    if (res.ok) {
      const { channelId } = await res.json()
      messagesCommand.set({ action: 'open', channelId })
    }
  }
</script>

<div class="space-y-8">
  <div class="flex items-start justify-between gap-4">
    <div>
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold">{council.name}</h1>
        <Badge variant="outline">{typeLabels[council.type] ?? council.type}</Badge>
      </div>
      <p class="text-sm text-muted-foreground">{council.unitName}</p>
      {#if council.scopeDescription}
        <p class="mt-2 text-sm">{council.scopeDescription}</p>
      {/if}
    </div>
    <div class="flex gap-2 shrink-0">
      <Button variant="outline" size="sm" href="/council/{council.id}/sessions">
        <CalendarDays class="size-4" />
        Sessions
      </Button>
      <Button variant="outline" size="sm" href="/council/{council.id}/proposals">
        <ClipboardList class="size-4" />
        Proposals
      </Button>
      {#if !isOwnCouncil}
        <Button variant="outline" size="sm" onclick={openCouncilChat}>
          <MessageSquare class="size-4" />
          Contact Council
        </Button>
      {/if}
    </div>
  </div>

  {#if council.nextSession}
    <Card.Root>
      <Card.Header>
        <Card.Title>Next Session</Card.Title>
      </Card.Header>
      <Card.Content>
        <p class="font-medium">{council.nextSession.title}</p>
        <p class="text-sm text-muted-foreground">
          {council.nextSession.scheduledAt.toLocaleString()}
        </p>
        <p class="text-sm text-muted-foreground mt-1">
          {council.nextSession.agendaItemCount} agenda item{council.nextSession.agendaItemCount !== 1 ? 's' : ''}
        </p>
      </Card.Content>
    </Card.Root>
  {/if}

  <div class="grid gap-6 lg:grid-cols-2">
    <Card.Root>
      <Card.Header>
        <Card.Title>Members ({council.members.length})</Card.Title>
      </Card.Header>
      <Card.Content>
        <ul class="space-y-3">
          {#each council.members as member}
            <li class="flex items-center gap-3">
              <Avatar.Root class="size-8">
                {#if member.avatarUrl}
                  <Avatar.Image src={member.avatarUrl} alt={member.name} />
                {/if}
                <Avatar.Fallback>{member.name.charAt(0).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
              <div>
                <a href="/citizens/{member.username}" class="text-sm font-medium hover:underline">
                  {member.name}
                </a>
                {#if member.representativeAreas.length > 0}
                  <p class="text-xs text-muted-foreground">
                    {member.representativeAreas.join(', ')}
                  </p>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      </Card.Content>
    </Card.Root>

    {#if council.representatives.length > 0}
      <Card.Root>
        <Card.Header>
          <Card.Title>Representatives</Card.Title>
        </Card.Header>
        <Card.Content>
          <ul class="space-y-3">
            {#each council.representatives as rep}
              <li class="flex items-center gap-3">
                <div>
                  <a href="/citizens/{rep.username}" class="text-sm font-medium hover:underline">
                    {rep.name}
                  </a>
                  <p class="text-xs text-muted-foreground">{rep.area}</p>
                </div>
              </li>
            {/each}
          </ul>
        </Card.Content>
      </Card.Root>
    {/if}
  </div>

  {#if council.openProposalCount > 0}
    <Card.Root>
      <Card.Header>
        <Card.Title>Pending Review</Card.Title>
      </Card.Header>
      <Card.Content>
        <p class="text-sm">
          {council.openProposalCount} proposal{council.openProposalCount !== 1 ? 's' : ''} awaiting council review.
        </p>
        <Button variant="outline" size="sm" class="mt-3" href="/council/{council.id}/proposals">
          Review proposals
        </Button>
      </Card.Content>
    </Card.Root>
  {/if}
</div>
