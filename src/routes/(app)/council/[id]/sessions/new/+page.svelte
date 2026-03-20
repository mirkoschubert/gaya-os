<script lang="ts">
  import { enhance } from '$app/forms'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Textarea } from '$lib/components/ui/textarea'
  import type { PageData, ActionData } from './$types'

  let { data, form }: { data: PageData; form: ActionData } = $props()
</script>

<div class="max-w-xl space-y-6">
  <div>
    <h1 class="text-2xl font-bold">New Session</h1>
    <p class="text-muted-foreground">{data.councilName}</p>
  </div>

  <Card.Root>
    <Card.Content class="pt-6">
      <form method="POST" use:enhance class="space-y-4">
        {#if form?.error}
          <p class="text-sm text-destructive">{form.error}</p>
        {/if}

        <div class="space-y-1">
          <Label for="title">Title</Label>
          <Input id="title" name="title" required />
        </div>

        <div class="space-y-1">
          <Label for="description">Description (optional)</Label>
          <Textarea id="description" name="description" rows={3} />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <Label for="scheduledAt">Start</Label>
            <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
          </div>
          <div class="space-y-1">
            <Label for="endsAt">End (optional)</Label>
            <Input id="endsAt" name="endsAt" type="datetime-local" />
          </div>
        </div>

        <div class="space-y-1">
          <Label for="location">Location (optional)</Label>
          <Input id="location" name="location" placeholder="URL or physical place" />
        </div>

        <div class="flex gap-2 pt-2">
          <Button type="submit">Create Session</Button>
          <Button variant="outline" href="/council/{data.councilId}/sessions">Cancel</Button>
        </div>
      </form>
    </Card.Content>
  </Card.Root>
</div>
