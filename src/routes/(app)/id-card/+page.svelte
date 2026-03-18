<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/state'
  import { onMount } from 'svelte'
  import type { PageData, ActionData } from './$types'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Textarea } from '$lib/components/ui/textarea'
  import { Checkbox } from '$lib/components/ui/checkbox'
  import { Separator } from '$lib/components/ui/separator'
  import { countries } from 'countries-list'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  const caps = $derived((page.data as { caps?: Record<string, boolean> }).caps ?? {})
  const canApplyCitizenship = $derived(caps['can_apply_citizenship'] ?? false)

  // Multi-step form state
  let step = $state(1)
  let constitutionAcknowledged = $state(false)
  let charCount = $state(0)
  let fingerprintId = $state('')

  // Pre-fill from user profile if available.
  let firstName = $state('')
  let lastName = $state('')
  $effect.pre(() => {
    firstName = data.user.firstName ?? ''
    lastName = data.user.lastName ?? ''
  })

  const motivationMinChars = $derived(data.motivationMinChars ?? 300)

  // Reset to step 2 if there's a server error
  $effect(() => {
    if (form?.error) step = 2
  })

  // Collect browser fingerprint client-side
  onMount(async () => {
    try {
      const { getFingerprint } = await import('@thumbmarkjs/thumbmarkjs')
      fingerprintId = await getFingerprint()
    } catch {
      // Fingerprinting not critical — proceed without it
    }
  })

  // Country list: sorted by name, with "Other / Not listed" at the end
  const COUNTRIES: { code: string; name: string }[] = [
    ...Object.entries(countries)
      .map(([code, c]) => ({ code, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    { code: 'OTHER', name: 'Other / Not listed' }
  ]

  // Searchable country field state
  let countrySearch = $state('')
  let selectedCountry = $state('')
  let countryDropdownOpen = $state(false)

  const filteredCountries = $derived(
    countrySearch.trim() === ''
      ? COUNTRIES
      : COUNTRIES.filter((c) =>
          c.name.toLowerCase().includes(countrySearch.trim().toLowerCase())
        )
  )

  const selectedCountryName = $derived(
    COUNTRIES.find((c) => c.code === selectedCountry)?.name ?? ''
  )

  function selectCountry(code: string, name: string) {
    selectedCountry = code
    countrySearch = name
    countryDropdownOpen = false
  }

  function handleCountryInput() {
    countryDropdownOpen = true
    // If the typed text no longer matches selection, clear selection
    if (countrySearch !== selectedCountryName) {
      selectedCountry = ''
    }
  }

  function handleCountryBlur() {
    // Delay to allow click on item to register
    setTimeout(() => {
      countryDropdownOpen = false
      // Restore display name if a valid country is still selected
      if (selectedCountry) {
        countrySearch = selectedCountryName
      }
    }, 150)
  }
</script>

<svelte:head><title>Citizenship · Gaya OS</title></svelte:head>

<div class="max-w-lg space-y-4">

  <!-- ─── CITIZEN: Show ID Card ─── -->
  {#if !canApplyCitizenship && data.user.civicStatus === 'CITIZEN'}
    <Card.Root>
      <Card.Header>
        <Card.Title>Your Citizen Card</Card.Title>
        <Card.Description>You are a full citizen of Gaya OS.</Card.Description>
      </Card.Header>
      <Card.Content class="space-y-3">
        <div class="flex flex-col gap-0.5">
          <span class="text-muted-foreground text-xs uppercase tracking-wide">Citizen ID</span>
          <span class="font-mono text-lg font-semibold">{data.user.citizenId}</span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-muted-foreground text-xs uppercase tracking-wide">Name</span>
          <span class="font-medium">
            {[data.user.firstName, data.user.lastName].filter(Boolean).join(' ') || data.user.name}
          </span>
        </div>
        {#if data.user.joinedAt}
          <div class="flex flex-col gap-0.5">
            <span class="text-muted-foreground text-xs uppercase tracking-wide">Member since</span>
            <span class="text-sm">
              {new Date(data.user.joinedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        {/if}
      </Card.Content>
    </Card.Root>

  <!-- ─── VISITOR: Application pending ─── -->
  {:else if data.application?.status === 'PENDING'}
    <Card.Root>
      <Card.Header>
        <Card.Title>Application Under Review</Card.Title>
        <Card.Description>
          Your citizenship application has been submitted and is currently being reviewed.
        </Card.Description>
      </Card.Header>
      <Card.Content class="space-y-3">
        <div class="flex flex-col gap-0.5">
          <span class="text-muted-foreground text-xs uppercase tracking-wide">Submitted</span>
          <span class="text-sm">
            {new Date(data.application.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </span>
        </div>
        <p class="text-muted-foreground text-sm">
          You will be notified once a decision has been made. Thank you for your patience.
        </p>
      </Card.Content>
    </Card.Root>

  <!-- ─── VISITOR: Application form (new or after rejection) ─── -->
  {:else}
    {#if data.application?.status === 'REJECTED'}
      <Card.Root class="border-destructive/50 bg-destructive/5">
        <Card.Header class="pb-3">
          <Card.Title class="text-destructive text-base">Previous Application Rejected</Card.Title>
        </Card.Header>
        <Card.Content>
          {#if data.application.reviewComment}
            <p class="text-sm">
              <span class="text-muted-foreground">Reason: </span>{data.application.reviewComment}
            </p>
          {:else}
            <p class="text-muted-foreground text-sm">No reason was provided. You may submit a new application below.</p>
          {/if}
        </Card.Content>
      </Card.Root>
    {/if}

    <!-- Step 1: Constitution acknowledgement -->
    {#if step === 1}
      <Card.Root>
        <Card.Header>
          <Card.Title>Apply for Citizenship</Card.Title>
          <Card.Description>
            Become a full citizen of Gaya OS and gain voting rights, the ability to delegate,
            and your personal Citizen ID.
          </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <p class="font-medium">Before you apply, please read and acknowledge the following:</p>
            <ul class="list-disc list-inside space-y-1 text-muted-foreground">
              <li>You are a real person and will only hold one citizen account.</li>
              <li>You accept the founding constitution and core values of Gaya OS.</li>
              <li>You will participate in democratic processes in good faith.</li>
              <li>Your application may be reviewed by administrators or council members.</li>
            </ul>
          </div>

          <div class="flex items-start gap-3">
            <Checkbox
              id="constitution"
              checked={constitutionAcknowledged}
              onCheckedChange={(v) => (constitutionAcknowledged = !!v)}
            />
            <Label for="constitution" class="cursor-pointer leading-snug">
              I have read and accept the constitution and core values of Gaya OS, and confirm
              that I am a real person applying for citizenship in good faith.
            </Label>
          </div>
        </Card.Content>
        <Separator />
        <Card.Footer class="pt-4">
          <Button
            class="w-full"
            disabled={!constitutionAcknowledged}
            onclick={() => (step = 2)}
          >
            Continue to Application
          </Button>
        </Card.Footer>
      </Card.Root>

    <!-- Step 2: Application form -->
    {:else}
      <Card.Root>
        <Card.Header>
          <Card.Title>Citizenship Application</Card.Title>
          <Card.Description>
            Please provide your real personal information. This information will be reviewed
            by our administrators.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form
            method="POST"
            action="?/submit"
            use:enhance
            class="space-y-5"
          >
            <!-- Hidden fields -->
            <input type="hidden" name="constitutionAcknowledged" value="on" />
            <input type="hidden" name="fingerprintId" value={fingerprintId} />

            <!-- Name fields -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label for="firstName">First name <span class="text-destructive">*</span></Label>
                <Input
                  id="firstName"
                  name="firstName"
                  bind:value={firstName}
                  placeholder="Ada"
                  required
                  maxlength={60}
                />
              </div>
              <div class="space-y-1.5">
                <Label for="lastName">Last name <span class="text-destructive">*</span></Label>
                <Input
                  id="lastName"
                  name="lastName"
                  bind:value={lastName}
                  placeholder="Lovelace"
                  required
                  maxlength={60}
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <Label for="middleNames">
                Middle name(s)
                <span class="text-muted-foreground text-xs">(optional — fill in if you have one, to avoid name collisions)</span>
              </Label>
              <Input
                id="middleNames"
                name="middleNames"
                placeholder="Augusta"
                maxlength={120}
              />
            </div>

            <!-- Country (searchable) -->
            <div class="space-y-1.5">
              <Label for="countrySearch">Country of residence <span class="text-destructive">*</span></Label>
              <input type="hidden" name="country" value={selectedCountry} />
              <div class="relative">
                <Input
                  id="countrySearch"
                  bind:value={countrySearch}
                  placeholder="Search country…"
                  autocomplete="off"
                  oninput={handleCountryInput}
                  onfocus={() => (countryDropdownOpen = true)}
                  onblur={handleCountryBlur}
                />
                {#if countryDropdownOpen && filteredCountries.length > 0}
                  <ul
                    class="bg-popover text-popover-foreground absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-md"
                    role="listbox"
                    aria-label="Countries"
                  >
                    {#each filteredCountries as c (c.code)}
                      <li
                        role="option"
                        aria-selected={selectedCountry === c.code}
                        class="hover:bg-accent hover:text-accent-foreground cursor-pointer px-3 py-2 text-sm {selectedCountry === c.code ? 'bg-accent text-accent-foreground font-medium' : ''}"
                        onmousedown={() => selectCountry(c.code, c.name)}
                      >
                        {c.name}
                      </li>
                    {/each}
                  </ul>
                {/if}
              </div>
            </div>

            <!-- City (required) -->
            <div class="space-y-1.5">
              <Label for="city">City <span class="text-destructive">*</span></Label>
              <Input id="city" name="city" placeholder="London" required maxlength={80} />
            </div>

            <!-- Motivation -->
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between">
                <Label for="motivationText">
                  Why do you want to become a citizen?
                  <span class="text-destructive">*</span>
                </Label>
                <span class="text-muted-foreground text-xs tabular-nums">
                  {charCount} / {motivationMinChars}
                </span>
              </div>
              <Textarea
                id="motivationText"
                name="motivationText"
                placeholder="Describe your motivation for joining Gaya OS and what you hope to contribute…"
                rows={6}
                oninput={(e) => (charCount = (e.target as HTMLTextAreaElement).value.length)}
                class="resize-none"
              />
              {#if charCount > 0 && charCount < motivationMinChars}
                <p class="text-muted-foreground text-xs">
                  {motivationMinChars - charCount} more character{motivationMinChars - charCount === 1 ? '' : 's'} required.
                </p>
              {/if}
            </div>

            {#if form?.error}
              <p class="text-destructive text-sm">{form.error}</p>
            {/if}

            <div class="flex gap-2">
              <Button
                type="button"
                variant="outline"
                class="flex-1"
                onclick={() => (step = 1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                class="flex-1"
                disabled={!selectedCountry}
              >
                Submit Application
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card.Root>
    {/if}
  {/if}
</div>
