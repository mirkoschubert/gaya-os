<script lang="ts">
  import { page } from '$app/state'
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { useSidebar } from '$lib/components/ui/sidebar'
  import { Building2, CalendarDays, ClipboardList } from '@lucide/svelte'
  import type { CouncilNavEntry } from '$lib/domain/council'

  let { councilMemberships }: { councilMemberships: CouncilNavEntry[] } = $props()

  const sidebar = useSidebar()

  function closeMobile() {
    if (sidebar.isMobile) {
      sidebar.setOpenMobile(false)
    }
  }
</script>

{#each councilMemberships as membership}
  <Sidebar.Menu>
    <Sidebar.MenuItem>
      <Sidebar.MenuButton
        isActive={page.url.pathname === `/council/${membership.councilId}`}
        tooltipContent={membership.councilName}
      >
        {#snippet child({ props })}
          <a href="/council/{membership.councilId}" {...props} onclick={closeMobile}>
            <Building2 />
            <span>{membership.councilName}</span>
          </a>
        {/snippet}
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
    <Sidebar.MenuItem>
      <Sidebar.MenuButton
        isActive={page.url.pathname.startsWith(`/council/${membership.councilId}/sessions`)}
        tooltipContent="Sessions"
      >
        {#snippet child({ props })}
          <a href="/council/{membership.councilId}/sessions" {...props} onclick={closeMobile}>
            <CalendarDays />
            <span>Sessions</span>
          </a>
        {/snippet}
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
    <Sidebar.MenuItem>
      <Sidebar.MenuButton
        isActive={page.url.pathname.startsWith(`/council/${membership.councilId}/proposals`)}
        tooltipContent="Review Proposals"
      >
        {#snippet child({ props })}
          <a href="/council/{membership.councilId}/proposals" {...props} onclick={closeMobile}>
            <ClipboardList />
            <span>Review Proposals</span>
          </a>
        {/snippet}
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  </Sidebar.Menu>
{/each}
