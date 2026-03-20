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
  import { Trash2 } from '@lucide/svelte'
  import type { VoteThreshold } from '$lib/domain/settings'

  let { data, form } = $props()

  // Only threshold type needs $state because it drives a conditional UI (supermajority % input)
  // and requiresElection for the Switch component which needs two-way reactivity
  let requiresElection = $state(false)
  let membershipOpen = $state(true)
  let nationStage = $state('MVP')
  let constitutionType = $state<VoteThreshold['type']>('unanimous')
  let policyType = $state<VoteThreshold['type']>('unanimous')
  let budgetType = $state<VoteThreshold['type']>('unanimous')
  let electionType = $state<VoteThreshold['type']>('unanimous')
  let allowVisitors = $state(false)
  let visitorChannels = $state('none')
  let activeTab = $state('councils')

  $effect(() => {
    requiresElection = data.settings.council.requiresElection
    membershipOpen = data.membershipOpen
    nationStage = data.nationStage
    constitutionType = data.settings.voting.thresholds.constitution.type
    policyType = data.settings.voting.thresholds.policy.type
    budgetType = data.settings.voting.thresholds.budget.type
    electionType = data.settings.voting.thresholds.election.type
    allowVisitors = data.settings.chat.allowVisitors
    visitorChannels = data.settings.chat.visitorChannels
    const f = form as { tab?: string } | null
    activeTab = f?.tab ?? activeTab
  })

  const reloadAfter: SubmitFunction = () => {
    return async ({ update }) => {
      await update({ reset: false })
    }
  }

  const STAGE_OPTIONS = [
    { value: 'MVP', label: 'MVP' },
    { value: 'Alpha', label: 'Alpha' },
    { value: 'Beta', label: 'Beta' },
    { value: 'Active', label: 'Active' },
    { value: 'Stable', label: 'Stable' }
  ]

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
      <Tabs.Trigger value="nation">Nation</Tabs.Trigger>
      <Tabs.Trigger value="councils">Councils</Tabs.Trigger>
      <Tabs.Trigger value="voting">Voting</Tabs.Trigger>
      <Tabs.Trigger value="proposals">Proposals</Tabs.Trigger>
      <Tabs.Trigger value="engagement">Engagement Points</Tabs.Trigger>
      <Tabs.Trigger value="username">Usernames</Tabs.Trigger>
      <Tabs.Trigger value="chat">Chat</Tabs.Trigger>
    </Tabs.List>

    <!-- Nation Tab -->
    <Tabs.Content value="nation">
      <Card.Root>
        <Card.Header>
          <Card.Title>Nation Status</Card.Title>
          <Card.Description>
            Controls visible on the public landing page. Changes take effect immediately.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form method="POST" action="?/updateNation" use:enhance={reloadAfter} class="space-y-6">
            <div class="space-y-2">
              <Label>Development stage</Label>
              <input type="hidden" name="stage" value={nationStage} />
              <Select.Root type="single" bind:value={nationStage}>
                <Select.Trigger class="w-48">
                  {STAGE_OPTIONS.find(o => o.value === nationStage)?.label ?? nationStage}
                </Select.Trigger>
                <Select.Content>
                  {#each STAGE_OPTIONS as opt}
                    <Select.Item value={opt.value}>{opt.label}</Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>
              <p class="text-muted-foreground text-xs">
                Shown in the status bar on the public landing page.
              </p>
            </div>
            <div class="flex items-center gap-3">
              <Switch.Root
                id="membershipOpen"
                checked={membershipOpen}
                onCheckedChange={(v) => (membershipOpen = v)}
              />
              <input type="hidden" name="membershipOpen" value={membershipOpen} />
              <Label for="membershipOpen">Citizenship applications open</Label>
            </div>
            <p class="text-muted-foreground text-xs -mt-4">
              When disabled, visitors can still register but cannot apply for citizenship.
            </p>
            <Button type="submit">Save nation settings</Button>
          </form>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

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
    <!-- Username Tab -->
    <Tabs.Content value="username">
      <div class="space-y-6">
        <!-- Cooldown setting -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Username Change Cooldown</Card.Title>
            <Card.Description>
              Minimum number of days a user must wait between username changes. Set to 0 to disable.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <form method="POST" action="?/updateUsername" use:enhance={reloadAfter} class="space-y-4">
              <div class="space-y-2">
                <Label for="changeCooldownDays">Cooldown (days)</Label>
                <Input
                  id="changeCooldownDays"
                  name="changeCooldownDays"
                  type="number"
                  min="0"
                  value={data.settings.username.changeCooldownDays}
                  class="w-40"
                />
                <p class="text-muted-foreground text-xs">
                  Default: 90 days. Users on cooldown see their next available change date.
                </p>
              </div>
              <Button type="submit">Save username settings</Button>
            </form>
          </Card.Content>
        </Card.Root>

        <!-- Blacklist -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Username Blacklist</Card.Title>
            <Card.Description>
              Patterns (exact words or regex) that users cannot register or switch to as a username.
              Matched case-insensitively.
            </Card.Description>
          </Card.Header>
          <Card.Content class="space-y-4">
            <!-- Add pattern form -->
            <form method="POST" action="?/addBlacklistPattern" use:enhance={reloadAfter} class="flex gap-3 items-end">
              <div class="space-y-1.5 flex-1">
                <Label for="pattern">Pattern</Label>
                <Input id="pattern" name="pattern" type="text" placeholder="e.g. admin or ^(fuck|shit).*" required />
              </div>
              <div class="space-y-1.5 flex-1">
                <Label for="reason">Reason (optional)</Label>
                <Input id="reason" name="reason" type="text" placeholder="e.g. Reserved word" />
              </div>
              <Button type="submit">Add pattern</Button>
            </form>

            <!-- Existing patterns table -->
            {#if data.blacklist.length === 0}
              <p class="text-muted-foreground text-sm">No patterns in the blacklist yet.</p>
            {:else}
              <div class="rounded-md border">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b bg-muted/40">
                      <th class="px-3 py-2 text-left font-medium">Pattern</th>
                      <th class="px-3 py-2 text-left font-medium">Reason</th>
                      <th class="px-3 py-2 text-left font-medium">Added by</th>
                      <th class="px-3 py-2 text-left font-medium">Date</th>
                      <th class="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each data.blacklist as entry}
                      <tr class="border-b last:border-0">
                        <td class="px-3 py-2 font-mono text-xs">{entry.pattern}</td>
                        <td class="text-muted-foreground px-3 py-2">{entry.reason ?? '—'}</td>
                        <td class="text-muted-foreground px-3 py-2">
                          {entry.createdBy?.username ? `@${entry.createdBy.username}` : (entry.createdBy?.name ?? '—')}
                        </td>
                        <td class="text-muted-foreground px-3 py-2">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td class="px-3 py-2 text-right">
                          <form method="POST" action="?/deleteBlacklistPattern" use:enhance={reloadAfter}>
                            <input type="hidden" name="id" value={entry.id} />
                            <Button type="submit" variant="ghost" size="icon" class="h-7 w-7">
                              <Trash2 class="h-3.5 w-3.5" />
                            </Button>
                          </form>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      </div>
    </Tabs.Content>
    <!-- Chat Tab -->
    <Tabs.Content value="chat">
      <Card.Root>
        <Card.Header>
          <Card.Title>Chat / Messages</Card.Title>
          <Card.Description>
            Control whether visitors can read or participate in the general citizen channel.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form method="POST" action="?/updateChat" use:enhance={reloadAfter} class="space-y-6">
            <div class="flex items-center gap-3">
              <Switch.Root
                id="allowVisitors"
                checked={allowVisitors}
                onCheckedChange={(v) => (allowVisitors = v)}
              />
              <input type="hidden" name="allowVisitors" value={allowVisitors} />
              <Label for="allowVisitors">Allow visitors to access chat</Label>
            </div>
            <p class="text-muted-foreground text-xs -mt-4">
              When disabled, visitors see no chat widget at all.
            </p>

            <div class="space-y-2">
              <Label>Visitor channel access</Label>
              <input type="hidden" name="visitorChannels" value={visitorChannels} />
              <Select.Root type="single" bind:value={visitorChannels} disabled={!allowVisitors}>
                <Select.Trigger class="w-64">
                  {{
                    none: 'No access',
                    readonly: 'Read only',
                    readwrite: 'Read and write'
                  }[visitorChannels] ?? visitorChannels}
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="none">No access</Select.Item>
                  <Select.Item value="readonly">Read only</Select.Item>
                  <Select.Item value="readwrite">Read and write</Select.Item>
                </Select.Content>
              </Select.Root>
              <p class="text-muted-foreground text-xs">
                Applies to the general citizen channel only. Visitors can never access council or DM channels.
              </p>
            </div>

            <Button type="submit">Save chat settings</Button>
          </form>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>
  </Tabs.Root>
</div>
