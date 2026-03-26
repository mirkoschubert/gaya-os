<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as Switch from '$lib/components/ui/switch'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Textarea } from '$lib/components/ui/textarea'
  import { Plus, Trash2, Loader2, ImageUp } from '@lucide/svelte'
  import Icon from '@iconify/svelte'
  import { authClient } from '$lib/auth-client'
  import { countries } from 'countries-list'
  import { LINK_TYPES, type ProfileLink } from '$lib/domain/auth'

  type EntityType = 'citizen' | 'council' | 'city'

  interface CitizenFields {
    id: string
    bio: string | null
    locationCity: string | null
    locationCountry: string | null
    links: ProfileLink[]
    showRealName: boolean
    avatarUrl: string | null
    heroUrl: string | null
  }

  interface CouncilFields {
    id: string
    scopeDescription: string | null
    banner: string | null
  }

  interface CityFields {
    id: string
    description: string | null
    banner: string | null
  }

  interface Props {
    open: boolean
    entityType: EntityType
    citizen?: CitizenFields
    council?: CouncilFields
    city?: CityFields
    onClose: () => void
    onSaved?: (updates?: Record<string, unknown>) => void
  }

  let { open = $bindable(), entityType, citizen, council, city, onClose, onSaved }: Props = $props()

  // Country list
  const COUNTRIES: { code: string; name: string }[] = [
    ...Object.entries(countries)
      .map(([code, c]) => ({ code, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    { code: 'OTHER', name: 'Other / Not listed' }
  ]

  // ─── Citizen state ───
  let bio = $state('')
  let locationCity = $state('')
  let locationCountry = $state('')
  let countrySearch = $state('')
  let countryDropdownOpen = $state(false)
  let links = $state<ProfileLink[]>([])
  let showRealName = $state(true)

  let localAvatarUrl = $state<string | null>(null)
  let localHeroUrl = $state<string | null>(null)
  let avatarUploading = $state(false)
  let heroUploading = $state(false)

  // ─── Council state ───
  let scopeDescription = $state('')
  let localCouncilBanner = $state<string | null>(null)
  let councilBannerUploading = $state(false)

  // ─── City state ───
  let description = $state('')
  let localCityBanner = $state<string | null>(null)
  let cityBannerUploading = $state(false)

  const filteredCountries = $derived(
    countrySearch.trim() === ''
      ? COUNTRIES
      : COUNTRIES.filter((c) => c.name.toLowerCase().includes(countrySearch.trim().toLowerCase()))
  )
  const selectedCountryName = $derived(
    COUNTRIES.find((c) => c.code === locationCountry)?.name ?? ''
  )

  function selectCountry(code: string, name: string) {
    locationCountry = code
    countrySearch = name
    countryDropdownOpen = false
  }

  function handleCountryInput() {
    countryDropdownOpen = true
    if (countrySearch !== selectedCountryName) locationCountry = ''
  }

  function handleCountryBlur() {
    setTimeout(() => {
      countryDropdownOpen = false
      if (locationCountry) countrySearch = selectedCountryName
    }, 150)
  }

  // Initialise from props when dialog opens
  $effect(() => {
    if (!open) return
    if (entityType === 'citizen' && citizen) {
      bio = citizen.bio ?? ''
      locationCity = citizen.locationCity ?? ''
      locationCountry = citizen.locationCountry ?? ''
      countrySearch = COUNTRIES.find((c) => c.code === citizen.locationCountry)?.name ?? ''
      links = citizen.links.map((l) => ({ ...l }))
      showRealName = citizen.showRealName
      localAvatarUrl = citizen.avatarUrl
      localHeroUrl = citizen.heroUrl
    } else if (entityType === 'council' && council) {
      scopeDescription = council.scopeDescription ?? ''
      localCouncilBanner = council.banner
    } else if (entityType === 'city' && city) {
      description = city.description ?? ''
      localCityBanner = city.banner
    }
  })

  let saving = $state(false)
  let error = $state<string | null>(null)

  function addLink() { links = [...links, { label: '', url: '' }] }
  function removeLink(i: number) { links = links.filter((_, j) => j !== i) }

  async function uploadFile(
    e: Event,
    endpoint: string,
    extraFields: Record<string, string>,
    onDone: (url: string) => void,
    setLoading: (v: boolean) => void
  ) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    for (const [k, v] of Object.entries(extraFields)) fd.append(k, v)
    const res = await fetch(endpoint, { method: 'POST', body: fd })
    setLoading(false)
    if (res.ok) {
      const { url } = await res.json()
      onDone(url)
    }
    input.value = ''
  }

  function initials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  async function save() {
    saving = true
    error = null

    try {
      if (entityType === 'citizen') {
        const validLinks = links.filter((l) => l.label.trim() && l.url.trim())
        const result = await authClient.updateUser({
          bio: bio.trim() || null,
          locationCity: locationCity.trim() || null,
          locationCountry: locationCountry || null,
          links: JSON.stringify(validLinks),
          showRealName
        } as Parameters<typeof authClient.updateUser>[0])
        if (result.error) throw new Error(result.error.message ?? 'Failed to save.')

      } else if (entityType === 'council' && council) {
        const res = await fetch(`/api/profile/council/${council.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scopeDescription: scopeDescription.trim() || null })
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.message ?? 'Failed to save.')
        }

      } else if (entityType === 'city' && city) {
        const res = await fetch(`/api/profile/city/${city.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: description.trim() || null })
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.message ?? 'Failed to save.')
        }
      }

      if (entityType === 'citizen') {
        onSaved?.({
          bio: bio.trim() || null,
          locationCity: locationCity.trim() || null,
          locationCountry: locationCountry || null,
          links: links.filter((l) => l.label.trim() && l.url.trim()),
          showRealName,
          avatarUrl: localAvatarUrl,
          heroUrl: localHeroUrl
        })
      } else if (entityType === 'council') {
        onSaved?.({
          scopeDescription: scopeDescription.trim() || null,
          banner: localCouncilBanner
        })
      } else if (entityType === 'city') {
        onSaved?.({
          description: description.trim() || null,
          banner: localCityBanner
        })
      }
      onClose()
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to save.'
    } finally {
      saving = false
    }
  }
</script>

<Dialog.Root bind:open onOpenChange={(v) => { if (!v) onClose() }}>
  <Dialog.Content class="max-w-lg max-h-[90vh] overflow-y-auto">
    <Dialog.Header>
      <Dialog.Title>
        {#if entityType === 'citizen'}Edit Profile{:else if entityType === 'council'}Edit Council{:else}Edit City{/if}
      </Dialog.Title>
    </Dialog.Header>

    <div class="flex flex-col gap-5 py-2">

      {#if entityType === 'citizen'}
        <!-- Profile Picture -->
        <div class="flex flex-col gap-2">
          <Label>Profile Picture</Label>
          <div class="flex items-center gap-4">
            <div class="relative shrink-0">
              <Avatar.Root class="size-16">
                {#if localAvatarUrl}
                  <Avatar.Image src={localAvatarUrl} alt="Avatar" />
                {/if}
                <Avatar.Fallback class="text-lg">
                  {initials(citizen?.showRealName ? '' : '')}
                </Avatar.Fallback>
              </Avatar.Root>
              <label class="absolute -bottom-1 -right-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors" title="Upload avatar">
                {#if avatarUploading}
                  <Loader2 class="size-3 animate-spin" />
                {:else}
                  <ImageUp class="size-3" />
                {/if}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="sr-only"
                  disabled={avatarUploading}
                  onchange={(e) => uploadFile(e, '/api/upload/avatar', {}, (url) => (localAvatarUrl = url), (v) => (avatarUploading = v))}
                />
              </label>
            </div>
            <p class="text-xs text-muted-foreground">Click the icon to upload a new picture.</p>
          </div>
        </div>

        <!-- Profile Banner -->
        <div class="flex flex-col gap-2">
          <Label>Profile Banner</Label>
          <div
            class="aspect-21/9 w-full rounded-md border bg-linear-to-br from-primary/20 to-primary/5 overflow-hidden relative"
            style={localHeroUrl ? `background-image: url('${localHeroUrl}'); background-size: cover; background-position: center;` : ''}
          >
            <label class="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity rounded-md" title="Upload banner">
              {#if heroUploading}
                <Loader2 class="size-5 animate-spin text-white" />
              {:else}
                <ImageUp class="size-5 text-white" />
              {/if}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="sr-only"
                disabled={heroUploading}
                onchange={(e) => uploadFile(e, '/api/upload/hero', {}, (url) => (localHeroUrl = url), (v) => (heroUploading = v))}
              />
            </label>
          </div>
          <p class="text-xs text-muted-foreground">Hover to change banner.</p>
        </div>

        <div class="flex flex-col gap-1.5">
          <Label for="pe-bio">Bio</Label>
          <Textarea id="pe-bio" bind:value={bio} rows={3} placeholder="Tell the nation about yourself..." />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <Label for="pe-locCity">City (optional)</Label>
            <Input id="pe-locCity" bind:value={locationCity} placeholder="e.g. Berlin" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="pe-locCountry">Country (optional)</Label>
            <div class="relative">
              <Input
                id="pe-locCountry"
                bind:value={countrySearch}
                placeholder="Search country..."
                autocomplete="off"
                oninput={handleCountryInput}
                onfocus={() => (countryDropdownOpen = true)}
                onblur={handleCountryBlur}
              />
              {#if countryDropdownOpen && filteredCountries.length > 0}
                <ul class="bg-popover text-popover-foreground absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border shadow-md" role="listbox">
                  {#each filteredCountries as c}
                    <li
                      role="option"
                      aria-selected={locationCountry === c.code}
                      class="cursor-pointer px-3 py-1.5 text-sm hover:bg-accent {locationCountry === c.code ? 'bg-accent' : ''}"
                      onmousedown={() => selectCountry(c.code, c.name)}
                    >{c.name}</li>
                  {/each}
                </ul>
              {/if}
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <Label>Links</Label>
          {#each links as link, i}
            {@const linkType = LINK_TYPES.find((t) => t.value === link.label)}
            <div class="flex flex-col gap-1.5">
              <div class="flex gap-2">
                <div class="relative shrink-0 w-36">
                  {#if linkType}
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Icon icon={linkType.iconName} width="14" height="14" style="stroke-width: 2" />
                    </span>
                  {/if}
                  <select
                    bind:value={link.label}
                    class="border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full appearance-none rounded-md border py-1 pr-2 text-sm focus-visible:outline-none focus-visible:ring-1 {linkType ? 'pl-7' : 'pl-3'}"
                  >
                    <option value="" disabled>Platform...</option>
                    {#each LINK_TYPES as t}
                      <option value={t.value}>{t.label}</option>
                    {/each}
                  </select>
                </div>
                <Input
                  bind:value={link.url}
                  placeholder={linkType?.placeholder ?? 'https://...'}
                  class="flex-1 min-w-0"
                />
                <Button type="button" variant="ghost" size="icon" onclick={() => removeLink(i)} class="shrink-0">
                  <Trash2 class="size-4" />
                </Button>
              </div>
              {#if linkType}
                <p class="text-xs text-muted-foreground pl-1">{linkType.inputLabel}</p>
              {/if}
            </div>
          {/each}
          <Button type="button" variant="outline" size="sm" onclick={addLink} class="self-start gap-1.5">
            <Plus class="size-3.5" />
            Add link
          </Button>
        </div>

        <div class="flex items-center gap-3">
          <Switch.Root id="pe-realname" bind:checked={showRealName} />
          <Label for="pe-realname" class="font-normal">Show real name publicly</Label>
        </div>

      {:else if entityType === 'council'}
        <!-- Council banner upload -->
        <div class="flex flex-col gap-1.5">
          <Label>Banner</Label>
          <div
            class="aspect-21/9 w-full rounded-md border bg-linear-to-br from-primary/20 to-primary/5 overflow-hidden relative"
            style={localCouncilBanner ? `background-image: url('${localCouncilBanner}'); background-size: cover; background-position: center;` : ''}
          >
            <label class="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity rounded-md" title="Upload banner">
              {#if councilBannerUploading}
                <Loader2 class="size-5 animate-spin text-white" />
              {:else}
                <ImageUp class="size-5 text-white" />
              {/if}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="sr-only"
                disabled={councilBannerUploading}
                onchange={(e) => uploadFile(e, '/api/upload/council-banner', { councilId: council!.id }, (url) => (localCouncilBanner = url), (v) => (councilBannerUploading = v))}
              />
            </label>
          </div>
          <p class="text-xs text-muted-foreground">Hover to change banner</p>
        </div>

        <div class="flex flex-col gap-1.5">
          <Label for="pe-scope">Description</Label>
          <Textarea id="pe-scope" bind:value={scopeDescription} rows={4} placeholder="Describe the council's scope and responsibilities..." />
        </div>

      {:else if entityType === 'city'}
        <!-- City banner upload -->
        <div class="flex flex-col gap-1.5">
          <Label>Banner</Label>
          <div
            class="aspect-21/9 w-full rounded-md border bg-linear-to-br from-primary/20 to-primary/5 overflow-hidden relative"
            style={localCityBanner ? `background-image: url('${localCityBanner}'); background-size: cover; background-position: center;` : ''}
          >
            <label class="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity rounded-md" title="Upload banner">
              {#if cityBannerUploading}
                <Loader2 class="size-5 animate-spin text-white" />
              {:else}
                <ImageUp class="size-5 text-white" />
              {/if}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="sr-only"
                disabled={cityBannerUploading}
                onchange={(e) => uploadFile(e, '/api/upload/city-banner', { cityId: city!.id }, (url) => (localCityBanner = url), (v) => (cityBannerUploading = v))}
              />
            </label>
          </div>
          <p class="text-xs text-muted-foreground">Hover to change banner</p>
        </div>

        <div class="flex flex-col gap-1.5">
          <Label for="pe-desc">Description</Label>
          <Textarea id="pe-desc" bind:value={description} rows={4} placeholder="Describe the city..." />
        </div>
      {/if}

      {#if error}
        <p class="text-sm text-destructive">{error}</p>
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={onClose} disabled={saving}>Cancel</Button>
      <Button onclick={save} disabled={saving}>
        {#if saving}<Loader2 class="size-4 animate-spin" />{/if}
        Save
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
