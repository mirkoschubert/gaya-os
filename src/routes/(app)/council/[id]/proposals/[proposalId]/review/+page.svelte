<script lang="ts">
  import { enhance } from '$app/forms'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Badge } from '$lib/components/ui/badge'
  import { Label } from '$lib/components/ui/label'
  import { Textarea } from '$lib/components/ui/textarea'
  import type { PageData, ActionData } from './$types'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  const proposal = $derived(data.proposal)
</script>

<div class="max-w-2xl space-y-6">
  <div>
    <h1 class="text-2xl font-bold">Review Proposal</h1>
  </div>

  <Card.Root>
    <Card.Header>
      <div class="flex items-start gap-2">
        <Card.Title class="flex-1">{proposal.title}</Card.Title>
        <Badge variant="outline">{proposal.category}</Badge>
      </div>
    </Card.Header>
    <Card.Content>
      <p class="text-sm whitespace-pre-line">{proposal.body}</p>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Council Decision</Card.Title>
    </Card.Header>
    <Card.Content>
      <form method="POST" use:enhance class="space-y-4">
        {#if form?.error}
          <p class="text-sm text-destructive">{form.error}</p>
        {/if}

        <div class="space-y-1">
          <Label for="note">Note for the author (optional)</Label>
          <Textarea
            id="note"
            name="note"
            rows={3}
            placeholder="Explain your decision or provide guidance for revision..."
          />
        </div>

        <div class="flex gap-2 pt-2">
          <Button type="submit" name="decision" value="READY_FOR_VOTE">
            Approve for Vote
          </Button>
          <Button type="submit" name="decision" value="DISCUSSION" variant="outline">
            Return to Discussion
          </Button>
          <Button variant="ghost" href="/council/{data.councilId}/proposals">Cancel</Button>
        </div>
      </form>
    </Card.Content>
  </Card.Root>
</div>
