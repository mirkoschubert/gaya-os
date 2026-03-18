<script lang="ts" generics="TData">
  import {
    type ColumnDef,
    type ColumnFiltersState,
    type RowSelectionState,
    type SortingState,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel
  } from '@tanstack/table-core'
  import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table'
  import * as Card from '$lib/components/ui/card'
  import * as Table from '$lib/components/ui/table'
  import { Input } from '$lib/components/ui/input'

  let {
    data,
    columns,
    filterColumn = 'username',
    filterPlaceholder = 'Filter…',
    onRowClick,
    rowActions
  }: {
    data: TData[]
    columns: ColumnDef<TData>[]
    filterColumn?: string
    filterPlaceholder?: string
    onRowClick?: (row: TData) => void
    rowActions?: import('svelte').Snippet<[TData]>
  } = $props()

  let sorting = $state<SortingState>([])
  let columnFilters = $state<ColumnFiltersState>([])
  let rowSelection = $state<RowSelectionState>({})

  const table = createSvelteTable({
    get data() { return data },
    get columns() { return columns },
    state: {
      get sorting() { return sorting },
      get columnFilters() { return columnFilters },
      get rowSelection() { return rowSelection }
    },
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater
    },
    onColumnFiltersChange: (updater) => {
      columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater
    },
    onRowSelectionChange: (updater) => {
      rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })
</script>

<div class="space-y-4">
  <Input
    placeholder={filterPlaceholder}
    value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
    oninput={(e) => table.getColumn(filterColumn)?.setFilterValue((e.target as HTMLInputElement).value)}
    class="max-w-sm"
  />

  <Card.Root class="overflow-hidden">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head class={header.id === 'select' ? 'w-10' : undefined}>
                {#if !header.isPlaceholder}
                  <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                {/if}
              </Table.Head>
            {/each}
            {#if rowActions}
              <Table.Head class="w-10"></Table.Head>
            {/if}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row
            data-state={row.getIsSelected() ? 'selected' : undefined}
            class={onRowClick ? 'cursor-pointer' : undefined}
            onclick={() => onRowClick?.(row.original)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onRowClick?.(row.original) }}
            role={onRowClick ? 'button' : undefined}
            tabindex={onRowClick ? 0 : undefined}
          >
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell class={cell.column.id === 'select' ? 'w-10' : undefined}>
                <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
              </Table.Cell>
            {/each}
            {#if rowActions}
              <Table.Cell onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="none">
                {@render rowActions(row.original)}
              </Table.Cell>
            {/if}
          </Table.Row>
        {/each}
        {#if table.getRowModel().rows.length === 0}
          <Table.Row>
            <Table.Cell colspan={columns.length + (rowActions ? 1 : 0)} class="h-24 text-center text-muted-foreground">
              No results found.
            </Table.Cell>
          </Table.Row>
        {/if}
      </Table.Body>
    </Table.Root>
  </Card.Root>
</div>
