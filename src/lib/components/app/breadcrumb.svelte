<script lang="ts">
  import * as Breadcrumb from '$lib/components/ui/breadcrumb'

  interface BreadcrumbItem {
    label: string
    href?: string
  }

  let { items }: { items: BreadcrumbItem[] } = $props()
</script>

<Breadcrumb.Root>
  <Breadcrumb.List>
    {#each items as item, i}
      <Breadcrumb.Item>
        {#if i < items.length - 1}
          {#if item.href}
            <Breadcrumb.Link href={item.href}>{item.label}</Breadcrumb.Link>
          {:else}
            <span class="text-muted-foreground text-sm">{item.label}</span>
          {/if}
        {:else}
          <Breadcrumb.Page>{item.label}</Breadcrumb.Page>
        {/if}
      </Breadcrumb.Item>
      {#if i < items.length - 1}
        <Breadcrumb.Separator />
      {/if}
    {/each}
  </Breadcrumb.List>
</Breadcrumb.Root>
