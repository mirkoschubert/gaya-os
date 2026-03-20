<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold">Review Proposals</h1>
    <p class="text-muted-foreground">{data.councilName}</p>
  </div>

  {#if data.proposals.length === 0}
    <p class="text-sm text-muted-foreground">No proposals pending review.</p>
  {:else}
    <div class="space-y-3">
      {#each data.proposals as proposal}
        <Card.Root>
          <Card.Content class="flex items-start justify-between p-4 gap-4">
            <div class="flex-1 min-w-0">
              <a href="/proposals/{proposal.id}" class="font-medium hover:underline">
                {proposal.title}
              </a>
              <div class="flex items-center gap-2 mt-1">
                <Badge variant="outline" class="text-xs">{proposal.category}</Badge>
                <span class="text-xs text-muted-foreground">
                  {proposal.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button size="sm" href="/council/{data.councilId}/proposals/{proposal.id}/review">
              Review
            </Button>
          </Card.Content>
        </Card.Root>
      {/each}
    </div>
  {/if}
</div>
