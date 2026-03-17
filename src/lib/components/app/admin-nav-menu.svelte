<script lang="ts">
  import { page } from '$app/state'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { useSidebar } from '$lib/components/ui/sidebar'
  import { Settings2, Users, BookOpen } from '@lucide/svelte'

  const sidebar = useSidebar()

  function closeMobile() {
    if (sidebar.isMobile) {
      sidebar.setOpenMobile(false)
    }
  }
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <Sidebar.MenuButton
      isActive={page.url.pathname === '/admin'}
      tooltipContent="Admin"
    >
      {#snippet child({ props })}
        <a href="/admin" {...props} onclick={closeMobile}>
          <Settings2 />
          <span>Admin</span>
        </a>
      {/snippet}
    </Sidebar.MenuButton>
  </Sidebar.MenuItem>
  <Sidebar.MenuItem>
    <Sidebar.MenuButton
      isActive={page.url.pathname.startsWith('/admin/users')}
      tooltipContent="Users"
    >
      {#snippet child({ props })}
        <a href="/admin/users" {...props} onclick={closeMobile}>
          <Users />
          <span>Users</span>
        </a>
      {/snippet}
    </Sidebar.MenuButton>
  </Sidebar.MenuItem>
  <Sidebar.MenuItem>
    <Sidebar.MenuButton
      isActive={page.url.pathname.startsWith('/admin/documents')}
      tooltipContent="Documents"
    >
      {#snippet child({ props })}
        <a href="/admin/documents" {...props} onclick={closeMobile}>
          <BookOpen />
          <span>Documents</span>
        </a>
      {/snippet}
    </Sidebar.MenuButton>
  </Sidebar.MenuItem>
</Sidebar.Menu>
