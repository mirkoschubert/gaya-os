<script lang="ts">
  import type { PageData, ActionData } from './$types'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Label } from '$lib/components/ui/label'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  let constitutionAcknowledged = $state(false)
</script>

<svelte:head><title>Citizenship · Gaya OS</title></svelte:head>

{#if data.user?.civicStatus === 'CITIZEN'}
  <div class="max-w-md">
    <Card.Root>
      <Card.Header>
        <Card.Title>Your Citizen Card</Card.Title>
        <Card.Description>You are a full citizen of Gaya OS.</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-3">
        <div class="flex flex-col gap-0.5">
          <span class="text-xs text-muted-foreground uppercase tracking-wide"
            >Citizen ID</span
          >
          <span class="font-mono font-semibold text-lg"
            >{data.user.citizenId}</span
          >
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-xs text-muted-foreground uppercase tracking-wide"
            >Name</span
          >
          <span class="font-medium">{data.user.name}</span>
        </div>
        {#if data.user.joinedAt}
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-muted-foreground uppercase tracking-wide"
              >Member since</span
            >
            <span class="text-sm"
              >{new Date(data.user.joinedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span
            >
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
{:else}
  <div class="max-w-md">
    <Card.Root>
      <Card.Header>
        <Card.Title>Apply for Citizenship</Card.Title>
        <Card.Description>
          Become a full citizen of Gaya OS and gain voting rights, the ability
          to delegate, and your personal Citizen ID.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <form method="POST" action="?/apply" class="flex flex-col gap-4">
          <p class="text-sm text-muted-foreground">
            By applying for citizenship you acknowledge the founding
            constitution of Gaya OS and agree to participate in good faith in
            its democratic processes.
          </p>

          <div class="flex items-start gap-3">
            <input
              id="constitution"
              type="checkbox"
              bind:checked={constitutionAcknowledged}
              class="mt-0.5 size-4 cursor-pointer"
            />
            <Label for="constitution" class="cursor-pointer leading-snug">
              I have read and accept the constitution of Gaya OS.
            </Label>
          </div>

          {#if form?.error}
            <p class="text-destructive text-sm">{form.error}</p>
          {/if}

          <Button
            type="submit"
            disabled={!constitutionAcknowledged}
            class="w-full"
          >
            Apply for citizenship
          </Button>
        </form>
      </Card.Content>
    </Card.Root>
  </div>
{/if}
