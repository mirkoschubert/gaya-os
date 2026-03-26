<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import * as Table from '$lib/components/ui/table'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Textarea } from '$lib/components/ui/textarea'
  import { Separator } from '$lib/components/ui/separator'
  import { enhance } from '$app/forms'
  import type { PageData, ActionData } from './$types'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  let name = $state('')
  let slug = $state('')
  let slugTouched = $state(false)

  $effect(() => {
    if (name && !slugTouched) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }
  })
</script>

<svelte:head>
  <title>Cities · Admin · Gaya OS</title>
</svelte:head>

<div class="mb-8">
  <h1 class="text-3xl font-bold tracking-tight">Cities</h1>
  <p class="text-muted-foreground mt-1 text-sm">Create and manage cities of the micro-nation.</p>
</div>

<div class="grid gap-6 lg:grid-cols-3">
  <div class="lg:col-span-2">
    <Card.Root>
      <Card.Header class="pb-3">
        <Card.Title class="text-base">All Cities</Card.Title>
      </Card.Header>
      <Separator />
      {#if data.cities.length === 0}
        <Card.Content>
          <p class="text-muted-foreground text-sm py-4">No cities yet. Create one on the right.</p>
        </Card.Content>
      {:else}
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head class="hidden sm:table-cell w-32">Slug</Table.Head>
              <Table.Head class="w-24">Status</Table.Head>
              <Table.Head class="hidden sm:table-cell w-24">Members</Table.Head>
              <Table.Head class="hidden md:table-cell">Council</Table.Head>
              <Table.Head class="w-20"></Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each data.cities as city}
              <Table.Row>
                <Table.Cell class="font-medium text-sm">{city.name}</Table.Cell>
                <Table.Cell class="hidden sm:table-cell font-mono text-xs text-muted-foreground">
                  {city.slug}
                </Table.Cell>
                <Table.Cell>
                  {#if city.active}
                    <Badge variant="default" class="text-xs">Active</Badge>
                  {:else}
                    <Badge variant="secondary" class="text-xs">Inactive</Badge>
                  {/if}
                </Table.Cell>
                <Table.Cell class="hidden sm:table-cell text-sm text-muted-foreground">
                  {city.memberCount}
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell text-sm text-muted-foreground">
                  {city.council?.name ?? '-'}
                </Table.Cell>
                <Table.Cell>
                  <Button variant="outline" size="sm" href="/admin/cities/{city.id}">Edit</Button>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      {/if}
    </Card.Root>
  </div>

  <div>
    <Card.Root>
      <Card.Header class="pb-3">
        <Card.Title class="text-base">New City</Card.Title>
      </Card.Header>
      <Separator />
      <Card.Content class="pt-4">
        <form method="POST" action="?/createCity" use:enhance class="flex flex-col gap-4">
          {#if form?.error}
            <p class="text-destructive text-sm">{form.error}</p>
          {/if}
          {#if form?.success}
            <p class="text-green-600 text-sm">City created successfully.</p>
          {/if}

          <div class="flex flex-col gap-1.5">
            <Label for="name">Name</Label>
            <Input
              id="name"
              name="name"
              bind:value={name}
              placeholder="e.g. Nova Civitas"
              required
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              bind:value={slug}
              oninput={() => { slugTouched = true }}
              placeholder="e.g. nova-civitas"
              pattern="[a-z0-9-]+"
              required
            />
            <p class="text-muted-foreground text-xs">URL: /nation/cities/{slug || '...'}</p>
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="description">Description (optional)</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="active" name="active" class="size-4 rounded border" />
            <Label for="active" class="font-normal">Activate immediately</Label>
          </div>

          <Button type="submit" size="sm">Create city</Button>
        </form>
      </Card.Content>
    </Card.Root>
  </div>
</div>
