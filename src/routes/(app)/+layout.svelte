<script lang="ts">
  import { page } from '$app/state'
  import { signOut, useSession } from '$lib/auth-client'
  import { goto, invalidateAll } from '$app/navigation'
  import type { AppUser } from '$lib/domain/auth'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import * as Avatar from '$lib/components/ui/avatar'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import NavMenu from '$lib/components/app/nav-menu.svelte'
  import AdminNavMenu from '$lib/components/app/admin-nav-menu.svelte'
  import CommunityNavMenu from '$lib/components/app/community-nav-menu.svelte'
  import CouncilNavMenu from '$lib/components/app/council-nav-menu.svelte'
  import MessagesWidget from '$lib/components/app/messages-widget.svelte'
  import { LogOut, Earth } from '@lucide/svelte'
  import AppBreadcrumb from '$lib/components/app/breadcrumb.svelte'

  let { data, children } = $props()

  const session = useSession()

  const user = $derived($session.data?.user as AppUser | undefined)

  const isAdmin = $derived(user?.role === 'ADMIN')

  interface BreadcrumbItem {
    label: string
    href?: string
  }

  const staticBreadcrumbs: Record<string, BreadcrumbItem[]> = {
    '/dashboard': [{ label: 'Overview' }],
    '/proposals': [{ label: 'Proposals' }],
    '/votes': [{ label: 'Votes' }],
    '/budget': [{ label: 'Budget' }],
    '/id-card': [{ label: 'ID Card' }],
    '/activity': [{ label: 'Activity' }],
    '/documents': [{ label: 'Documents' }],
    '/citizens': [{ label: 'Citizens' }],
    '/admin': [{ label: 'Admin' }],
    '/admin/users': [{ label: 'Admin', href: '/admin' }, { label: 'User Management' }],
    '/admin/roles': [{ label: 'Admin', href: '/admin' }, { label: 'Roles & Permissions' }],
    '/admin/governance': [{ label: 'Admin', href: '/admin' }, { label: 'Governance Settings' }],
    '/admin/documents': [{ label: 'Admin', href: '/admin' }, { label: 'Documents' }],
    '/admin/documents/new': [{ label: 'Admin', href: '/admin' }, { label: 'Documents', href: '/admin/documents' }, { label: 'New' }],
    '/settings/profile': [{ label: 'Settings' }, { label: 'Profile' }],
    '/settings/security': [{ label: 'Settings' }, { label: 'Security & Privacy' }]
  }

  // Use breadcrumbs from page data if provided by the route's load function,
  // otherwise fall back to static mapping
  const breadcrumbs = $derived(
    (page.data as { breadcrumbs?: BreadcrumbItem[] }).breadcrumbs ??
    staticBreadcrumbs[page.url.pathname] ??
    []
  )

  // Avatar initial: prefer firstName, fall back to name
  const userInitial = $derived(
    (user?.firstName || user?.name || '?').charAt(0).toUpperCase()
  )

  // Sidebar display: show @username below full name
  const displayName = $derived(user?.name ?? '')
  const displayHandle = $derived(
    user?.username ? `@${user.username}` : (user?.email ?? '')
  )
  const tooltipLabel = $derived(
    user?.username ? `@${user.username}` : (user?.name ?? 'Account')
  )

  async function handleSignOut() {
    await signOut()
    await invalidateAll()
    await goto('/')
  }
</script>

<Sidebar.Provider>
  <Sidebar.Root collapsible="icon">
    <Sidebar.Header>
      <div class="flex h-9 items-center px-2">
        <a href="/" class="flex items-center gap-2 overflow-hidden">
          <Earth class="size-4 shrink-0" />
          <span class="font-semibold group-data-[collapsible=icon]:hidden"
            >Gaya OS</span
          >
        </a>
      </div>
    </Sidebar.Header>

    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <NavMenu />
        </Sidebar.GroupContent>
      </Sidebar.Group>

      <Sidebar.Group>
        <Sidebar.GroupLabel>Community</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <CommunityNavMenu />
        </Sidebar.GroupContent>
      </Sidebar.Group>

      {#if data.isCouncilMember}
        <Sidebar.Group>
          <Sidebar.GroupLabel>Council</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <CouncilNavMenu councilMemberships={data.councilMemberships} />
          </Sidebar.GroupContent>
        </Sidebar.Group>
      {/if}

      {#if isAdmin}
        <Sidebar.Group>
          <Sidebar.GroupLabel>Admin</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <AdminNavMenu />
          </Sidebar.GroupContent>
        </Sidebar.Group>
      {/if}
    </Sidebar.Content>

    <Sidebar.Footer>
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <DropdownMenu.Root>
            <Sidebar.MenuButton size="lg" tooltipContent={tooltipLabel}>
              {#snippet child({ props })}
                <DropdownMenu.Trigger {...props}>
                  <Avatar.Root class="size-8 rounded-full shrink-0">
                    {#if user?.avatarUrl}
                      <Avatar.Image src={user.avatarUrl} alt={user.name} />
                    {/if}
                    <Avatar.Fallback>{userInitial}</Avatar.Fallback>
                  </Avatar.Root>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">{displayName}</span>
                    <span class="truncate text-xs text-muted-foreground"
                      >{displayHandle}</span
                    >
                  </div>
                </DropdownMenu.Trigger>
              {/snippet}
            </Sidebar.MenuButton>
            <DropdownMenu.Content side="top" align="end" class="w-56">
              <DropdownMenu.Item>
                <a href="/settings/profile" class="flex w-full"
                  >Profile settings</a
                >
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                <a href="/settings/security" class="flex w-full"
                  >Security & Privacy</a
                >
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item onclick={handleSignOut}>
                <LogOut />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Footer>

    <Sidebar.Rail />
  </Sidebar.Root>

  {#if data.caps['can_send_messages'] || data.caps['can_view_messages']}
    <MessagesWidget
      channels={data.chatChannels}
      userId={data.user.id}
      canSendMessages={data.caps['can_send_messages'] ?? false}
      canModerateMessages={data.caps['can_moderate_messages'] ?? false}
    />
  {/if}

  <Sidebar.Inset>
    <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <Sidebar.Trigger class="-ml-1" />
      <Separator orientation="vertical" class="h-4" />
      {#if breadcrumbs.length > 0}
        <AppBreadcrumb items={breadcrumbs} />
      {/if}
      <div class="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" onclick={handleSignOut}>
          <LogOut class="size-4" />
          Sign out
        </Button>
      </div>
    </header>
    <main class="p-6">
      {@render children()}
    </main>
  </Sidebar.Inset>
</Sidebar.Provider>
