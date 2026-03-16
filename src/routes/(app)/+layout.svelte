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
  import NavMenu from '$lib/components/nav-menu.svelte'
  import AdminNavMenu from '$lib/components/admin-nav-menu.svelte'
  import { LogOut, Earth } from '@lucide/svelte'

  let { children } = $props()

  const session = useSession()

  const user = $derived($session.data?.user as AppUser | undefined)

  const isAdmin = $derived(user?.role === 'ADMIN')

  const titles: Record<string, string> = {
    '/dashboard': 'Overview',
    '/proposals': 'Proposals',
    '/votes': 'Votes',
    '/budget': 'Budget',
    '/citizenship': 'Citizenship',
    '/activity': 'Activity',
    '/documents': 'Documents',
    '/admin': 'Admin',
    '/admin/users': 'User Management',
    '/admin/documents': 'Documents',
    '/settings/profile': 'Profile Settings',
    '/settings/security': 'Security & Privacy'
  }
  const title = $derived(titles[page.url.pathname] ?? '')

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

  <Sidebar.Inset>
    <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <Sidebar.Trigger class="-ml-1" />
      <Separator orientation="vertical" class="h-4" />
      <span class="text-sm font-medium">{title}</span>
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
