<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import * as Select from '$lib/components/ui/select'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as Dialog from '$lib/components/ui/dialog'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Textarea } from '$lib/components/ui/textarea'
  import { Separator } from '$lib/components/ui/separator'
  import { Upload, Trash2 } from '@lucide/svelte'
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import type { PageData, ActionData } from './$types'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  const city = $derived(data.city)

  let name = $state('')
  let slug = $state('')
  let description = $state('')
  let banner = $state('')
  let active = $state(false)
  let councilId = $state('')

  $effect.pre(() => {
    name = city.name
    slug = city.slug
    description = city.description ?? ''
    banner = city.banner ?? ''
    active = city.active
    councilId = city.council?.id ?? ''
  })

  let deleteOpen = $state(false)

  const submitDelete: SubmitFunction = () => {
    return async ({ update }) => { deleteOpen = false; await update({ reset: false }) }
  }

  let bannerLoading = $state(false)
  let bannerError = $state('')

  async function uploadBanner(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    bannerLoading = true
    bannerError = ''
    const fd = new FormData()
    fd.append('file', file)
    fd.append('cityId', city.id)
    const res = await fetch('/api/upload/city-banner', { method: 'POST', body: fd })
    bannerLoading = false
    if (res.ok) {
      const { url } = await res.json()
      banner = url
    } else {
      bannerError = 'Upload failed.'
    }
  }

  function initials(n: string) {
    return n.split(' ').map((s) => s[0]).join('').toUpperCase().slice(0, 2)
  }
</script>

<svelte:head>
  <title>{city.name} · Cities · Admin · Gaya OS</title>
</svelte:head>

<div class="mb-8 flex items-center justify-between gap-4">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">{city.name}</h1>
    <p class="text-muted-foreground mt-1 text-sm font-mono">#{city.slug}</p>
  </div>
  <div class="flex items-center gap-2">
    {#if city.active}
      <Badge variant="default">Active</Badge>
    {:else}
      <Badge variant="secondary">Inactive</Badge>
    {/if}
    <Button variant="outline" size="sm" href="/admin/cities">Back to cities</Button>
  </div>
</div>

<div class="grid gap-6 lg:grid-cols-2">
  <!-- Edit form -->
  <Card.Root>
    <Card.Header class="pb-3">
      <Card.Title class="text-base">City Details</Card.Title>
    </Card.Header>
    <Separator />
    <Card.Content class="pt-4">
      <form method="POST" action="?/updateCity" use:enhance class="flex flex-col gap-4">
        {#if form?.updateError}
          <p class="text-destructive text-sm">{form.updateError}</p>
        {/if}
        {#if form?.updateSuccess}
          <p class="text-green-600 text-sm">Changes saved.</p>
        {/if}

        <div class="flex flex-col gap-1.5">
          <Label for="name">Name</Label>
          <Input id="name" name="name" bind:value={name} required />
        </div>

        <div class="flex flex-col gap-1.5">
          <Label for="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            bind:value={slug}
            pattern="[a-z0-9-]+"
            required
          />
          <p class="text-muted-foreground text-xs">URL: /nation/cities/{slug}</p>
        </div>

        <div class="flex flex-col gap-1.5">
          <Label for="description">Description</Label>
          <Textarea id="description" name="description" bind:value={description} rows={3} />
        </div>

        <div class="flex flex-col gap-1.5">
          <Label>Banner image</Label>
          <input type="hidden" name="banner" value={banner} />
          <div class="aspect-21/9 w-full overflow-hidden rounded-md border bg-linear-to-br from-primary/20 to-primary/5">
            {#if banner}
              <img src={banner} alt="City banner" class="h-full w-full object-cover" />
            {/if}
          </div>
          {#if bannerError}
            <p class="text-destructive text-xs">{bannerError}</p>
          {/if}
          <label class="flex cursor-pointer items-center gap-2 text-sm">
            <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" onchange={uploadBanner} disabled={bannerLoading} />
            <Button type="button" variant="outline" size="sm" class="pointer-events-none gap-1.5">
              <Upload class="size-3.5" />
              {bannerLoading ? 'Uploading...' : 'Upload banner'}
            </Button>
            <span class="text-muted-foreground text-xs">JPG, PNG or WebP, max 5 MB</span>
          </label>
        </div>

        <div class="flex flex-col gap-1.5">
          <Label for="foundedAt">Founded</Label>
          <Input
            id="foundedAt"
            name="foundedAt"
            type="date"
            value={city.foundedAt.toISOString().slice(0, 10)}
          />
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            name="active"
            class="size-4 rounded border"
            bind:checked={active}
          />
          <Label for="active" class="font-normal">Active (visible to citizens)</Label>
        </div>

        <Button type="submit" size="sm">Save changes</Button>
      </form>
    </Card.Content>
  </Card.Root>

  <div class="flex flex-col gap-6">
    <!-- Council assignment -->
    <Card.Root>
      <Card.Header class="pb-3">
        <Card.Title class="text-base">City Council</Card.Title>
      </Card.Header>
      <Separator />
      <Card.Content class="pt-4">
        <form method="POST" action="?/setCouncil" use:enhance class="flex flex-col gap-4">
          {#if form?.councilError}
            <p class="text-destructive text-sm">{form.councilError}</p>
          {/if}
          {#if form?.councilSuccess}
            <p class="text-green-600 text-sm">Council updated.</p>
          {/if}

          <div class="flex flex-col gap-1.5">
            <Label for="councilId">Assigned council</Label>
            <Select.Root type="single" name="councilId" bind:value={councilId}>
              <Select.Trigger id="councilId">
                {data.councils.find((c) => c.id === councilId)?.name ?? 'None'}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="">None</Select.Item>
                {#each data.councils as council}
                  <Select.Item value={council.id}>{council.name}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>

          <Button type="submit" size="sm" variant="outline">Update council</Button>
        </form>
      </Card.Content>
    </Card.Root>

    <!-- Members (read-only) -->
    <Card.Root>
      <Card.Header class="pb-3">
        <Card.Title class="text-base">Members ({city.memberCount})</Card.Title>
      </Card.Header>
      <Separator />
      <Card.Content class="pt-4">
        {#if city.members.length === 0}
          <p class="text-muted-foreground text-sm">No members yet.</p>
        {:else}
          <ul class="space-y-2">
            {#each city.members as member}
              <li class="flex items-center gap-2">
                <Avatar.Root class="size-7">
                  {#if member.avatarUrl}
                    <Avatar.Image src={member.avatarUrl} alt={member.displayName} />
                  {/if}
                  <Avatar.Fallback class="text-xs">{initials(member.displayName)}</Avatar.Fallback>
                </Avatar.Root>
                <span class="text-sm">{member.displayName}</span>
                {#if member.username}
                  <span class="text-xs text-muted-foreground">@{member.username}</span>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </Card.Content>
    </Card.Root>

    <!-- Danger zone -->
    <Card.Root class="border-destructive/40">
      <Card.Header class="pb-3">
        <Card.Title class="text-base text-destructive">Danger Zone</Card.Title>
      </Card.Header>
      <Separator />
      <Card.Content class="pt-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-medium">Delete this city</p>
            <p class="text-muted-foreground text-xs">
              Permanently deletes the city, its council, all channels, posts, and memberships. This cannot be undone.
            </p>
          </div>
          <Button variant="destructive" size="sm" onclick={() => (deleteOpen = true)}>
            <Trash2 class="size-3.5" />
            Delete city
          </Button>
        </div>
        {#if form?.deleteError}
          <p class="text-destructive text-sm mt-2">{form.deleteError}</p>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
</div>

<!-- Delete confirmation dialog -->
<Dialog.Root bind:open={deleteOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete city?</Dialog.Title>
      <Dialog.Description>
        This will permanently delete <strong>{city.name}</strong> including its council, all channels, posts, and memberships. This cannot be undone.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (deleteOpen = false)}>Cancel</Button>
      <form method="POST" action="?/deleteCity" use:enhance={submitDelete}>
        <Button type="submit" variant="destructive">Delete</Button>
      </form>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
