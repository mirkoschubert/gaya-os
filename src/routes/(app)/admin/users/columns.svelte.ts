import type { ColumnDef } from '@tanstack/table-core'
import {
  renderComponent,
  DataTableCheckbox,
  DataTableHeaderButton
} from '$lib/components/ui/data-table/index.js'
import UserTableBadgeCell from '$lib/components/app/user-table-badge-cell.svelte'
import type { AdminUserView } from '$lib/server/services/users'

function formatDate(d: Date | string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { dateStyle: 'medium' })
}

export const columns: ColumnDef<AdminUserView>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      renderComponent(DataTableCheckbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
        onCheckedChange: (v) => table.toggleAllPageRowsSelected(!!v),
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      renderComponent(DataTableCheckbox, {
        checked: row.getIsSelected(),
        indeterminate: false,
        onCheckedChange: (v) => row.toggleSelected(!!v),
        'aria-label': 'Select row'
      }),
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'username',
    accessorFn: (row) => row.username ?? row.name ?? row.email,
    header: ({ column }) =>
      renderComponent(DataTableHeaderButton, {
        label: 'Username',
        onclick: column.getToggleSortingHandler()
      }),
    cell: ({ row }) =>
      row.original.username ? `@${row.original.username}` : row.original.name || '—',
    enableSorting: true
  },
  {
    accessorKey: 'email',
    header: ({ column }) =>
      renderComponent(DataTableHeaderButton, {
        label: 'Email',
        onclick: column.getToggleSortingHandler()
      }),
    cell: ({ row }) => row.original.email,
    enableSorting: true
  },
  {
    accessorKey: 'role',
    header: ({ column }) =>
      renderComponent(DataTableHeaderButton, {
        label: 'Role',
        onclick: column.getToggleSortingHandler()
      }),
    cell: ({ row }) => {
      const role = row.original.role
      const variant = role === 'ADMIN' ? 'destructive' : role === 'MODERATOR' ? 'secondary' : 'outline'
      return renderComponent(UserTableBadgeCell, { value: role, variant })
    },
    enableSorting: true
  },
  {
    accessorKey: 'civicStatus',
    header: ({ column }) =>
      renderComponent(DataTableHeaderButton, {
        label: 'Status',
        onclick: column.getToggleSortingHandler()
      }),
    cell: ({ row }) => {
      const status = row.original.civicStatus
      const appStatus = row.original.applicationStatus
      // Show PENDING badge for visitors who have applied
      if (status === 'VISITOR' && appStatus === 'PENDING') {
        return renderComponent(UserTableBadgeCell, { value: 'Applied', variant: 'secondary' })
      }
      return renderComponent(UserTableBadgeCell, { value: status, variant: status === 'CITIZEN' ? 'default' : 'outline' })
    },
    enableSorting: true
  },
  {
    accessorKey: 'lastLogin',
    header: ({ column }) =>
      renderComponent(DataTableHeaderButton, {
        label: 'Last Login',
        onclick: column.getToggleSortingHandler()
      }),
    cell: ({ row }) => formatDate(row.original.lastLogin),
    enableSorting: true
  }
]
