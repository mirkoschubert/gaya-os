<script lang="ts">
  import { page } from '$app/state'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { useSidebar } from '$lib/components/ui/sidebar'
  import {
    LayoutDashboard,
    FileText,
    Vote,
    Wallet,
    Activity,
    BookOpen,
    type Icon
  } from '@lucide/svelte'
  import type { Component } from 'svelte'

  const navItems: { href: string; label: string; icon: Component<Icon> }[] = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/documents', label: 'Documents', icon: BookOpen },
    { href: '/proposals', label: 'Proposals', icon: FileText },
    { href: '/votes', label: 'Votes', icon: Vote },
    { href: '/budget', label: 'Budget', icon: Wallet },
    { href: '/activity', label: 'Activity', icon: Activity }
  ]

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
