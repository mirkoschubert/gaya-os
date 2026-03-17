<script lang="ts">
  import { page } from '$app/state'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { useSidebar } from '$lib/components/ui/sidebar'
  import { Users, UserRound, IdCard, type Icon } from '@lucide/svelte'
  import { useSession } from '$lib/auth-client'
  import type { AppUser } from '$lib/domain/auth'
  import type { Component } from 'svelte'

  const session = useSession()
  const user = $derived($session.data?.user as AppUser | undefined)

  const isCitizen = $derived(user?.civicStatus === 'CITIZEN')

  const navItems = $derived<{ href: string; label: string; icon: Component<Icon> }[]>([
    { href: '/citizens', label: 'Citizens', icon: Users },
    ...(isCitizen && user?.username
      ? [{ href: `/citizens/${user.username}`, label: 'My Profile', icon: UserRound }]
      : []),
    { href: '/id-card', label: isCitizen ? 'ID Card' : 'Citizenship', icon: IdCard }
  ])

  const sidebar = useSidebar()

  function closeMobile() {
    if (sidebar.isMobile) {
      sidebar.setOpenMobile(false)
    }
  }
</script>

<Sidebar.Menu>
  {#each navItems as item}
    <Sidebar.MenuItem>
      <Sidebar.MenuButton
        isActive={page.url.pathname === item.href}
        tooltipContent={item.label}
      >
        {#snippet child({ props })}
          <a href={item.href} {...props} onclick={closeMobile}>
            <item.icon />
            <span>{item.label}</span>
          </a>
        {/snippet}
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  {/each}
</Sidebar.Menu>
