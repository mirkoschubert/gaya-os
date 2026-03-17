<script lang="ts">
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import * as Card from '$lib/components/ui/card'
  import * as Tabs from '$lib/components/ui/tabs'
  import * as Select from '$lib/components/ui/select'
  import * as Switch from '$lib/components/ui/switch'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Button } from '$lib/components/ui/button'
  import type { VoteThreshold } from '$lib/domain/settings'

  let { data, form } = $props()

  // Only threshold type needs $state because it drives a conditional UI (supermajority % input)
  // and requiresElection for the Switch component which needs two-way reactivity
  let requiresElection = $state(false)
  let constitutionType = $state<VoteThreshold['type']>('unanimous')
  let policyType = $state<VoteThreshold['type']>('unanimous')
  let budgetType = $state<VoteThreshold['type']>('unanimous')
  let electionType = $state<VoteThreshold['type']>('unanimous')
  let activeTab = $state('councils')

  $effect(() => {
    requiresElection = data.settings.council.requiresElection
    constitutionType = data.settings.voting.thresholds.constitution.type
    policyType = data.settings.voting.thresholds.policy.type
    budgetType = data.settings.voting.thresholds.budget.type
    electionType = data.settings.voting.thresholds.election.type
    const f = form as { tab?: string } | null
    activeTab = f?.tab ?? activeTab
  })

  const reloadAfter: SubmitFunction = () => {
    return async ({ update }) => {
      await update({ reset: false })
    }
  }

  const THRESHOLD_OPTIONS = [
    { value: 'unanimous', label: 'Unanimous (100%)' },
    { value: 'supermajority', label: 'Supermajority (custom %)' },
    { value: 'majority', label: 'Simple Majority (>50%)' }
  ]
</script>

<svelte:head><title>Governance Settings · Admin · Gaya OS</title></svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-xl font-semibold">Governance Settings</h1>
    <p class="text-muted-foreground text-sm">
      Configure voting thresholds, proposal rules, council parameters, and engagement scoring. All
      changes are logged in the activity feed.
    </p>
  </div>

  {#if form?.message}
    <p class="text-destructive text-sm">{form.message}</p>
  {:else if form?.success}
    <p class="text-sm text-green-600">Settings saved.</p>
  {/if}

  <Tabs.Root bind:value={activeTab}>
    <Tabs.List class="mb-6">
      <Tabs.Trigger value="councils">Councils</Tabs.Trigger>
      <Tabs.Trigger value="voting">Voting</Tabs.Trigger>
      <Tabs.Trigger value="proposals">Proposals</Tabs.Trigger>
      <Tabs.Trigger value="engagement">Engagement Points</Tabs.Trigger>
    </Tabs.List>

    <!-- Councils Tab -->
    <Tabs.Content value="councils">
      <Card.Root>
        <Card.Header>
          <Card.Title>Council Configuration</Card.Title>
          <Card.Description>
            Settings that govern the size and term structure of councils within each unit.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form method="POST" action="?/updateCouncil" use:enhance={reloadAfter} class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="minSize">Minimum council members</Label>
                <Input
                  id="minSize"
                  name="minSize"
                  type="number"
                  min="1"
                  value={data.settings.council.minSize}
                />
              </div>
              <div class="space-y-2">
                <Label for="maxSize">Maximum council members</Label>
                <Input
                  id="maxSize"
                  name="maxSize"
                  type="number"
                  min="1"
                  value={data.settings.council.maxSize}
                />
              </div>
              <div class="space-y-2">
                <Label for="termLimitMonths">Term limit (months, 0 = unlimited)</Label>
                <Input
                  id="termLimitMonths"
                  name="termLimitMonths"
                  type="number"
                  min="0"
                  value={data.settings.council.termLimitMonths}
                />
              </div>
            </div>
            <div class="flex items-center gap-3">
              <Switch.Root
                id="requiresElection"
                checked={requiresElection}
                onCheckedChange={(v) => (requiresElection = v)}
              />
              <input type="hidden" name="requiresElection" value={requiresElection} />
              <Label for="requiresElection">Require formal election for council seats</Label>
            </div>
            <Button type="submit">Save council settings</Button>
          </form>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Voting Tab -->
    <Tabs.Content value="voting">
      <Card.Root>
        <Card.Header>
          <Card.Title>Voting Thresholds</Card.Title>
          <Card.Description>
            Define the required majority for each type of decision.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form method="POST" action="?/updateVoting" use:enhance={reloadAfter} class="space-y-6">
            {#each [
              { id: 'constitution', label: 'Constitutional changes', type: constitutionType, setType: (v: VoteThreshold['type']) => (constitutionType = v), percent: data.settings.voting.thresholds.constitution.percent },
              { id: 'policy', label: 'Policy changes', type: policyType, setType: (v: VoteThreshold['type']) => (policyType = v), percent: data.settings.voting.thresholds.policy.percent },
              { id: 'budget', label: 'Budget decisions', type: budgetType, setType: (v: VoteThreshold['type']) => (budgetType = v), percent: data.settings.voting.thresholds.budget.percent },
              { id: 'election', label: 'Elections', type: electionType, setType: (v: VoteThreshold['type']) => (electionType = v), percent: data.settings.voting.thresholds.election.percent }
            ] as item}
              <div class="space-y-2">
                <Label>{item.label}</Label>
                <div class="flex items-center gap-3">
                  <Select.Root
                    type="single"
                    value={item.type}
                    onValueChange={(v) => item.setType(v as VoteThreshold['type'])}
                  >
                    <Select.Trigger class="w-64">
                      {THRESHOLD_OPTIONS.find(o => o.value === item.type)?.label ?? 'Select...'}
                    </Select.Trigger>
                    <Select.Content>
                      {#each THRESHOLD_OPTIONS as opt}
                        <Select.Item value={opt.value}>{opt.label}</Select.Item>
                      {/each}
                    </Select.Content>
                  </Select.Root>
                  {#if item.type === 'supermajority'}
                    <div class="flex items-center gap-2">
                      <Input
                        name="{item.id}Percent"
                        type="number"
                        min="0.5"
                        max="1"
                        step="0.01"
                        value={item.percent ?? 0.66}
                        class="w-24"
                        placeholder="0.66"
                      />
                      <span class="text-muted-foreground text-sm">(e.g. 0.66 = 66%)</span>
                    </div>
                  {/if}
                </div>
                <input type="hidden" name="{item.id}Type" value={item.type} />
              </div>
            {/each}

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t pt-4">
              <div class="space-y-2">
                <Label for="minParticipationPercent">Minimum participation (%)</Label>
                <Input
                  id="minParticipationPercent"
                  name="minParticipationPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={data.settings.voting.minParticipationPercent}
                />
                <p class="text-muted-foreground text-xs">
                  Minimum percentage of eligible voters required for a vote to be valid.
                </p>
              </div>
              <div class="space-y-2">
                <Label for="defaultDurationDays">Default voting duration (days)</Label>
                <Input
                  id="defaultDurationDays"
                  name="defaultDurationDays"
                  type="number"
                  min="1"
                  value={data.settings.voting.defaultDurationDays}
                />
              </div>
            </div>

            <Button type="submit">Save voting settings</Button>
          </form>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Proposals Tab -->
    <Tabs.Content value="proposals">
      <Card.Root>
        <Card.Header>
          <Card.Title>Proposal Rules</Card.Title>
          <Card.Description>
            Configure thresholds and timelines for the proposal lifecycle.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form method="POST" action="?/updateProposals" use:enhance={reloadAfter} class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="minSupportCount">Minimum supports to advance</Label>
                <Input
                  id="minSupportCount"
                  name="minSupportCount"
                  type="number"
                  min="0"
                  value={data.settings.proposal.minSupportCount}
                />
                <p class="text-muted-foreground text-xs">
                  How many citizens must support a proposal before the council can review it.
                </p>
              </div>
              <div class="space-y-2">
                <Label for="minDays">Minimum discussion days</Label>
                <Input
                  id="minDays"
                  name="minDays"
                  type="number"
                  min="0"
                  value={data.settings.proposal.discussion.minDays}
                />
                <p class="text-muted-foreground text-xs">
                  Minimum days a proposal must remain in DISCUSSION before the council can advance it.
                </p>
              </div>
            </div>
            <Button type="submit">Save proposal settings</Button>
          </form>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Engagement Points Tab -->
    <Tabs.Content value="engagement">
      <Card.Root>
        <Card.Header>
          <Card.Title>Engagement Points</Card.Title>
          <Card.Description>
            Points awarded for community participation. These are reputation/gamification points
            only — they do not affect voting power.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form method="POST" action="?/updateEngagement" use:enhance={reloadAfter} class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="PROPOSAL_CREATED">Creating a proposal</Label>
                <Input
                  id="PROPOSAL_CREATED"
                  name="PROPOSAL_CREATED"
                  type="number"
                  min="0"
                  value={data.settings.engagement.points.PROPOSAL_CREATED}
                />
              </div>
              <div class="space-y-2">
                <Label for="COMMENT_CREATED">Writing a comment</Label>
                <Input
                  id="COMMENT_CREATED"
                  name="COMMENT_CREATED"
                  type="number"
                  min="0"
                  value={data.settings.engagement.points.COMMENT_CREATED}
                />
              </div>
              <div class="space-y-2">
                <Label for="VOTE_CAST">Casting a vote</Label>
                <Input
                  id="VOTE_CAST"
                  name="VOTE_CAST"
                  type="number"
                  min="0"
                  value={data.settings.engagement.points.VOTE_CAST}
                />
              </div>
              <div class="space-y-2">
                <Label for="DELEGATION_RECEIVED">Receiving a delegation</Label>
                <Input
                  id="DELEGATION_RECEIVED"
                  name="DELEGATION_RECEIVED"
                  type="number"
                  min="0"
                  value={data.settings.engagement.points.DELEGATION_RECEIVED}
                />
              </div>
              <div class="space-y-2">
                <Label for="DOCUMENT_VERSION_AUTHORED">Authoring a document version</Label>
                <Input
                  id="DOCUMENT_VERSION_AUTHORED"
                  name="DOCUMENT_VERSION_AUTHORED"
                  type="number"
                  min="0"
                  value={data.settings.engagement.points.DOCUMENT_VERSION_AUTHORED}
                />
              </div>
            </div>
            <Button type="submit">Save engagement settings</Button>
          </form>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>
  </Tabs.Root>
</div>
