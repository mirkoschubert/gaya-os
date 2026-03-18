<script lang="ts">
  import { enhance } from '$app/forms'
  import type { SubmitFunction } from '@sveltejs/kit'
  import UserTable from '$lib/components/app/user-table.svelte'
  import * as Dialog from '$lib/components/ui/dialog'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as Drawer from '$lib/components/ui/drawer'
  import * as Tabs from '$lib/components/ui/tabs'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Textarea } from '$lib/components/ui/textarea'
  import { Label } from '$lib/components/ui/label'
  import { Separator } from '$lib/components/ui/separator'
  import EllipsisIcon from '@lucide/svelte/icons/ellipsis'
  import AlertTriangleIcon from '@lucide/svelte/icons/triangle-alert'
  import { columns } from './columns.svelte.js'
  import type { ApplicationView } from '$lib/server/services/citizenship'
  import type { AdminUserView } from '$lib/server/services/users'

  let { data, form } = $props()

  // ─── Delete dialog ───
  let pendingDelete = $state<{ id: string; email: string } | null>(null)

  // ─── Approve / Reject dialogs ───
  let pendingApprove = $state<{ applicationId: string; userName: string } | null>(null)
  let pendingReject = $state<{ applicationId: string; userName: string } | null>(null)
  let rejectComment = $state('')
  let approveComment = $state('')

  // ─── Detail Drawer ───
  let drawerOpen = $state(false)
  let selectedUserId = $state<string | null>(null)
  const selectedUser = $derived(
    selectedUserId ? (data.users as AdminUserView[]).find((u) => u.id === selectedUserId) ?? null : null
  )
  const selectedApplication = $derived(
    selectedUserId ? (data.applicationsByUser[selectedUserId] as ApplicationView | undefined) ?? null : null
  )

  function openDrawer(user: AdminUserView) {
    selectedUserId = user.id
    drawerOpen = true
  }

  // ─── Helpers ───
  function roleBadgeVariant(role: string) {
    if (role === 'ADMIN') return 'destructive' as const
    if (role === 'MODERATOR') return 'secondary' as const
    return 'outline' as const
  }

  function civicBadgeVariant(status: string) {
    return status === 'CITIZEN' ? 'default' as const : 'outline' as const
  }

  function statusBadgeVariant(status: string) {
    if (status === 'APPROVED') return 'default' as const
    if (status === 'REJECTED') return 'destructive' as const
    return 'secondary' as const
  }

  function formatDate(d: Date | string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { dateStyle: 'medium' })
  }

  function formatDateTime(d: Date | string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
  }

  const FLAG_LABELS: Record<string, string> = {
    IP_MULTIPLE_APPS_SAME_IP: 'Multiple applications from the same IP address',
    FP_MULTIPLE_APPS_SAME_FINGERPRINT: 'Multiple applications from the same device fingerprint',
    DISPOSABLE_EMAIL_DOMAIN: 'Disposable or temporary email domain',
    GEO_COUNTRY_MISMATCH: 'Declared country differs from IP-derived country',
    MANUAL_DEBUG_OVERRIDE: 'Submitted in debug mode — may be test data',
    SUSPICIOUS_PATTERN: 'Manually flagged as suspicious',
    CITIZENSHIP_REVOKED: 'Citizenship was revoked'
  }

  const reloadAfter: SubmitFunction = () => {
    return async ({ update }) => { await update({ reset: false }) }
  }

  const submitDelete: SubmitFunction = () => {
    return async ({ update }) => { pendingDelete = null; await update({ reset: false }) }
  }

  const submitApprove: SubmitFunction = () => {
    return async ({ update }) => { pendingApprove = null; approveComment = ''; await update({ reset: false }) }
  }

  const submitReject: SubmitFunction = () => {
    return async ({ update }) => { pendingReject = null; rejectComment = ''; await update({ reset: false }) }
  }
</script>

<svelte:head><title>Users · Admin · Gaya OS</title></svelte:head>

<!-- ─── Delete dialog ─── -->
<Dialog.Root
  open={!!pendingDelete}
  onOpenChange={(open) => { if (!open) pendingDelete = null }}
>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete user?</Dialog.Title>
      <Dialog.Description>
        This will permanently delete <strong>{pendingDelete?.email}</strong> including all their
        sessions and data. This cannot be undone.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (pendingDelete = null)}>Cancel</Button>
      <form method="POST" action="?/deleteUser" use:enhance={submitDelete}>
        <input type="hidden" name="userId" value={pendingDelete?.id} />
        <Button type="submit" variant="destructive">Delete</Button>
      </form>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- ─── Approve dialog ─── -->
<Dialog.Root
  open={!!pendingApprove}
  onOpenChange={(open) => { if (!open) { pendingApprove = null; approveComment = '' } }}
>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Approve citizenship?</Dialog.Title>
      <Dialog.Description>
        Grant citizenship to <strong>{pendingApprove?.userName}</strong>.
        They will receive a Citizen ID and full voting rights.
      </Dialog.Description>
    </Dialog.Header>
    <div class="px-6 py-2 space-y-2">
      <Label for="approveComment">Comment (optional)</Label>
      <Textarea
        id="approveComment"
        bind:value={approveComment}
        placeholder="Welcome note or internal remark…"
        rows={3}
      />
    </div>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => { pendingApprove = null; approveComment = '' }}>
        Cancel
      </Button>
      <form method="POST" action="?/approveApplication" use:enhance={submitApprove}>
        <input type="hidden" name="applicationId" value={pendingApprove?.applicationId} />
        <input type="hidden" name="comment" value={approveComment} />
        <Button type="submit">Approve</Button>
      </form>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- ─── Reject dialog ─── -->
<Dialog.Root
  open={!!pendingReject}
  onOpenChange={(open) => { if (!open) { pendingReject = null; rejectComment = '' } }}
>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Reject application?</Dialog.Title>
      <Dialog.Description>
        Reject the citizenship application of <strong>{pendingReject?.userName}</strong>.
        They will remain a Visitor and may reapply.
      </Dialog.Description>
    </Dialog.Header>
    <div class="px-6 py-2 space-y-2">
      <Label for="rejectComment">Reason <span class="text-destructive">*</span></Label>
      <Textarea
        id="rejectComment"
        bind:value={rejectComment}
        placeholder="Please provide a reason for the rejection…"
        rows={3}
        required
      />
    </div>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => { pendingReject = null; rejectComment = '' }}>
        Cancel
      </Button>
      <form method="POST" action="?/rejectApplication" use:enhance={submitReject}>
        <input type="hidden" name="applicationId" value={pendingReject?.applicationId} />
        <input type="hidden" name="comment" value={rejectComment} />
        <Button type="submit" variant="destructive" disabled={!rejectComment.trim()}>
          Reject
        </Button>
      </form>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- ─── Detail Drawer ─── -->
<Drawer.Root bind:open={drawerOpen} direction="right">
  <Drawer.Content class="flex flex-col inset-y-0 right-0 w-full sm:max-w-lg">
    {#if selectedUser}
      <Drawer.Header class="shrink-0">
        <Drawer.Title>
          {selectedUser.firstName || selectedUser.lastName
            ? `${selectedUser.firstName} ${selectedUser.lastName}`.trim()
            : selectedUser.name}
        </Drawer.Title>
        <Drawer.Description>{selectedUser.email}</Drawer.Description>
      </Drawer.Header>

      <div class="px-4 pb-4 flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full">
        <Tabs.Root value="details">
          <Tabs.List class="w-full">
            <Tabs.Trigger value="details" class="flex-1">Details</Tabs.Trigger>
            <Tabs.Trigger value="citizenship" class="flex-1">
              Citizenship
              {#if selectedApplication?.status === 'PENDING'}
                <Badge variant="secondary" class="ml-1.5 text-xs">Pending</Badge>
              {/if}
            </Tabs.Trigger>
          </Tabs.List>

          <!-- Details Tab -->
          <Tabs.Content value="details" class="mt-4 space-y-4">
            <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <p class="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Username</p>
                <p>{selectedUser.username ? `@${selectedUser.username}` : '—'}</p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Role</p>
                <Badge variant={roleBadgeVariant(selectedUser.role)}>{selectedUser.role}</Badge>
              </div>
              <div>
                <p class="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Civic Status</p>
                <Badge variant={civicBadgeVariant(selectedUser.civicStatus)}>
                  {selectedUser.civicStatus}
                </Badge>
              </div>
              <div>
                <p class="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Email Verified</p>
                <p class={selectedUser.emailVerified ? 'text-green-600' : 'text-muted-foreground'}>
                  {selectedUser.emailVerified ? '✓ Verified' : '✗ Unverified'}
                </p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Registered</p>
                <p>{formatDate(selectedUser.createdAt)}</p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Last Login</p>
                <p>{formatDate(selectedUser.lastLogin)}</p>
              </div>
            </div>

            {#if selectedUser.technicalProfile}
              {@const tp = selectedUser.technicalProfile}
              <Separator />
              <div>
                <p class="text-muted-foreground text-xs uppercase tracking-wide mb-1">Technical Profile</p>
                <div class="text-xs space-y-0.5 font-mono bg-muted/30 rounded-md p-2 overflow-x-hidden">
                  <p><span class="text-muted-foreground">Reg. IP:</span> {tp.registrationIp ?? '—'}</p>
                  <p><span class="text-muted-foreground">Last IP:</span> {tp.lastIp ?? '—'}</p>
                  {#if tp.lastUserAgent}
                    <p class="break-all"><span class="text-muted-foreground">Last UA:</span> {tp.lastUserAgent}</p>
                  {/if}
                  {#if tp.ipHistory && tp.ipHistory.length > 0}
                    <div class="mt-1">
                      <p class="text-muted-foreground not-italic mb-0.5">IP History (last {tp.ipHistory.length}):</p>
                      {#each tp.ipHistory.slice(0, 10) as entry}
                        <p class="pl-2">{entry.ip} <span class="text-muted-foreground font-sans">{formatDateTime(entry.seenAt)}</span></p>
                      {/each}
                      {#if tp.ipHistory.length > 10}
                        <p class="text-muted-foreground font-sans pl-2">… and {tp.ipHistory.length - 10} more</p>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
            {/if}

            {#if !selectedUser.emailVerified}
              <Separator />
              <div class="flex gap-2">
                <form method="POST" action="?/verifyEmail" use:enhance={reloadAfter} class="flex-1">
                  <input type="hidden" name="userId" value={selectedUser.id} />
                  <Button type="submit" variant="outline" size="sm" class="w-full">
                    Mark email verified
                  </Button>
                </form>
                <form method="POST" action="?/resendVerification" use:enhance={reloadAfter} class="flex-1">
                  <input type="hidden" name="userId" value={selectedUser.id} />
                  <input type="hidden" name="email" value={selectedUser.email} />
                  <Button type="submit" variant="outline" size="sm" class="w-full">
                    Resend verification
                  </Button>
                </form>
              </div>
            {/if}
          </Tabs.Content>

          <!-- Citizenship Tab -->
          <Tabs.Content value="citizenship" class="mt-4 space-y-4">
            {#if selectedUser.civicStatus === 'CITIZEN' && selectedUser.citizenId}
              <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div class="col-span-2">
                  <p class="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Citizen ID</p>
                  <p class="font-mono">{selectedUser.citizenId}</p>
                </div>
                {#if selectedUser.joinedAt}
                  <div>
                    <p class="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Joined</p>
                    <p>{formatDate(selectedUser.joinedAt)}</p>
                  </div>
                {/if}
              </div>
              {#if selectedApplication}
                <Separator />
              {/if}
            {/if}

            {#if !selectedApplication}
              {#if selectedUser.civicStatus !== 'CITIZEN'}
                <p class="text-muted-foreground text-sm">No citizenship application on file.</p>
              {/if}
            {:else}
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Status</p>
                  <Badge variant={statusBadgeVariant(selectedApplication.status)}>
                    {selectedApplication.status}
                  </Badge>
                </div>
                <p class="text-muted-foreground text-xs">
                  Submitted {formatDateTime(selectedApplication.createdAt)}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div class="col-span-2">
                  <p class="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Full Name</p>
                  <p>
                    {[selectedApplication.firstName, selectedApplication.middleNames, selectedApplication.lastName]
                      .filter(Boolean)
                      .join(' ')}
                  </p>
                </div>
                <div>
                  <p class="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Country</p>
                  <p>{selectedApplication.country}</p>
                </div>
                <div>
                  <p class="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">City</p>
                  <p>{selectedApplication.city ?? '—'}</p>
                </div>
              </div>

              <div>
                <p class="text-muted-foreground text-xs uppercase tracking-wide mb-1">Motivation</p>
                <p class="text-sm bg-muted/50 rounded-md p-3 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {selectedApplication.motivationText}
                </p>
              </div>

              <div>
                <p class="text-muted-foreground text-xs uppercase tracking-wide mb-1">Technical Data (Application)</p>
                <div class="text-xs space-y-0.5 font-mono bg-muted/30 rounded-md p-2 overflow-x-hidden">
                  <p><span class="text-muted-foreground">IP:</span> {selectedApplication.ipAddress ?? '—'}</p>
                  <p><span class="text-muted-foreground">Fingerprint:</span> {selectedApplication.fingerprintId ?? '—'}</p>
                  <p><span class="text-muted-foreground">Geo:</span> {selectedApplication.geoCountry ?? '—'}</p>
                  {#if selectedApplication.userAgent}
                    <p class="break-all"><span class="text-muted-foreground">UA:</span> {selectedApplication.userAgent}</p>
                  {/if}
                </div>
              </div>

              {#if selectedApplication.flags.length > 0}
                <div>
                  <p class="text-muted-foreground text-xs uppercase tracking-wide mb-1">Flags</p>
                  <div class="space-y-1.5">
                    {#each selectedApplication.flags as flag}
                      <div class="flex items-start gap-2 text-sm">
                        <Badge
                          variant={flag.code === 'MANUAL_DEBUG_OVERRIDE' ? 'destructive' : 'secondary'}
                          class="mt-0.5 shrink-0 text-xs"
                        >
                          {flag.code === 'MANUAL_DEBUG_OVERRIDE' ? 'DEBUG' : '!'}
                        </Badge>
                        <div>
                          <p class="font-medium">{FLAG_LABELS[flag.code] ?? flag.code}</p>
                          {#if flag.detail}
                            <p class="text-muted-foreground text-xs">{flag.detail}</p>
                          {/if}
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}

              {#if selectedApplication.status !== 'PENDING' && selectedApplication.reviewedAt}
                <Separator />
                <div>
                  <p class="text-muted-foreground text-xs uppercase tracking-wide mb-1">Decision</p>
                  <p class="text-sm">
                    {selectedApplication.status === 'APPROVED' ? 'Approved' : 'Rejected'} on
                    {formatDateTime(selectedApplication.reviewedAt)}
                  </p>
                  {#if selectedApplication.reviewComment}
                    <p class="text-sm text-muted-foreground mt-1">
                      "{selectedApplication.reviewComment}"
                    </p>
                  {/if}
                </div>
              {/if}

              {#if selectedApplication.status === 'PENDING'}
                <Separator />
                <div class="flex gap-2">
                  <Button
                    class="flex-1"
                    onclick={() => {
                      drawerOpen = false
                      setTimeout(() => {
                        pendingApprove = {
                          applicationId: selectedApplication!.id,
                          userName: [selectedApplication!.firstName, selectedApplication!.lastName].join(' ')
                        }
                      }, 300)
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    class="flex-1"
                    onclick={() => {
                      drawerOpen = false
                      setTimeout(() => {
                        pendingReject = {
                          applicationId: selectedApplication!.id,
                          userName: [selectedApplication!.firstName, selectedApplication!.lastName].join(' ')
                        }
                      }, 300)
                    }}
                  >
                    Reject
                  </Button>
                </div>
              {/if}
            {/if}
          </Tabs.Content>
        </Tabs.Root>
      </div>
    {/if}
  </Drawer.Content>
</Drawer.Root>

<!-- ─── Main content ─── -->
<div class="space-y-4">
  <div>
    <h1 class="text-xl font-semibold">Users</h1>
    <p class="text-muted-foreground text-sm">{data.users.length} registered accounts</p>
  </div>

  {#if data.debugMode}
    <div class="flex items-center gap-2 rounded-md border border-yellow-400/50 bg-yellow-50 px-4 py-2 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
      <AlertTriangleIcon class="size-4 shrink-0" />
      <span><strong>Debug mode is active.</strong> Citizenship throttling and age checks are disabled. Applications may contain test data.</span>
    </div>
  {/if}

  {#if form?.message}
    <p class="text-destructive text-sm">{form.message}</p>
  {:else if form?.success}
    {#if (form as { migratedCount?: number }).migratedCount !== undefined}
      <p class="text-sm text-green-600">
        Migrated {(form as { migratedCount: number }).migratedCount} citizen ID(s) to the new format.
      </p>
    {:else if (form as { action?: string }).action}
      <p class="text-sm text-green-600">
        Application {(form as { action: string }).action} successfully.
      </p>
    {:else}
      <p class="text-sm text-green-600">Done.</p>
    {/if}
  {/if}

  <form method="POST" action="?/migrateCitizenIds" use:enhance={reloadAfter}>
    <Button type="submit" variant="outline" size="sm">Migrate old citizen IDs</Button>
  </form>

  <UserTable
    data={data.users as AdminUserView[]}
    {columns}
    filterColumn="username"
    filterPlaceholder="Filter users…"
    onRowClick={openDrawer}
  >
    {#snippet rowActions(user)}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button variant="ghost" size="icon" {...props}>
              <EllipsisIcon class="size-4" />
              <span class="sr-only">Actions</span>
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item onclick={() => openDrawer(user)}>
            View details
          </DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Set role</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              {#each ['USER', 'MODERATOR', 'ADMIN'] as role}
                <DropdownMenu.Item>
                  <form method="POST" action="?/setRole" use:enhance={reloadAfter}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="hidden" name="role" value={role} />
                    <button
                      type="submit"
                      class="flex w-full items-center gap-2 disabled:opacity-50"
                      disabled={user.role === role}
                    >
                      {role}
                      {#if user.role === role}
                        <span class="text-muted-foreground text-xs">(current)</span>
                      {/if}
                    </button>
                  </form>
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>

          <DropdownMenu.Separator />

          <DropdownMenu.Item>
            <button
              type="button"
              class="text-destructive flex w-full"
              onclick={() => (pendingDelete = { id: user.id, email: user.email })}
            >
              Delete user
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {/snippet}
  </UserTable>
</div>
