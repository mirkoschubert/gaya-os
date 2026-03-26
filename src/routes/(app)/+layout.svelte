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
    '/nation/citizens': [{ label: 'Citizens' }],
    '/nation/cities': [{ label: 'Cities' }],
    '/nation/councils': [{ label: 'Councils' }],
    '/admin': [{ label: 'Admin' }],
    '/admin/users': [{ label: 'Admin', href: '/admin' }, { label: 'User Management' }],
    '/admin/roles': [{ label: 'Admin', href: '/admin' }, { label: 'Roles & Permissions' }],
    '/admin/governance': [{ label: 'Admin', href: '/admin' }, { label: 'Governance Settings' }],
    '/admin/documents': [{ label: 'Admin', href: '/admin' }, { label: 'Documents' }],
    '/admin/cities': [{ label: 'Admin', href: '/admin' }, { label: 'Cities' }],
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
          <!-- <Earth class="size-4 shrink-0" /> -->
          <svg class="size-6 shrink-0" fill="none" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><clipPath id="a"><path d="m0 0h512v512h-512z"/></clipPath><g clip-path="url(#a)"><path d="m4.10511 305.072c49.05449 253.68 385.39589 276.13 486.28489 53.748-69.868-38.166-158.804.908-243.011 26.342-128.279 36.746-199.9731 8.857-243.28403-80.09z" fill="#20bbcc"/><g fill="#30d5c8"><path d="m497.023 341.398c-37.913-31.628-118.637-29.678-184.035-5.028-91.217 31.151-195.331 81.08-270.0732 6.673 78.8862 46.435 151.9822 15.235 240.2122-33.821 82.258-42.363 165.907-43.663 223.851-3.209-1.971 10.674-5.465 22.334-9.944 35.395z"/><path d="m288.706 298.579c-25.188 14.875-55.468 29.296-90.695 42.243-28.453 9.302-53.803 13.391-76.092 13.391-64.745 0-103.6732-34.528-117.60611-76.492-.07094-.187-.13186-.372-.19267-.568-.37522-1.143-.73006-2.307-1.06473-3.46-.30417-1.072-.57803-2.122-.82138-3.173-.2839-1.607-.55765-3.193-.81114-4.769-1.541401-9.796-1.794889-19.737-.932969-29.626.131862-1.461.273759-2.924.425892-4.387 7.371927-70.622 44.454907-137.752 97.741607-177.492-78.6068 79.687-74.8648 168.118-14.7137 222.269 46.4022 44.489 124.2992 53.275 204.7622 22.064z"/><path d="m406.237 83.7831c-111.388-52.827-219.089.171-259.017 33.2729 72.689-45.0464 173.531-30.2016 183.257-27.1302 144.353 39.4152 182.233 117.2222 180.697 183.2562 9.726-118.758-68.934-171.483-104.937-189.3989z"/></g><path d="m87.8792 240.654c.0041.004.0071.008.0112.012l-.0102-.01-.001-.002c-58.3544-69.839-19.0556-196.702 107.0608-232.90768 127.861-30.94702 235.76 34.92998 285.212 124.79568 5.634 10.237 13.825 28.177 15.36 33.296-25.391-48.457-78.204-97.4976-137.946-111.0872-68.079-13.6501-133.253-4.4586-194.172 38.3508-56.948 42.8294-82.5717 91.9154-75.5148 147.5524z" fill="#20bbcc"/></g></svg>
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
