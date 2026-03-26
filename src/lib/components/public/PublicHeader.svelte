<script lang="ts">
  import { signOut, useSession } from '$lib/auth-client'
  import { goto, invalidateAll } from '$app/navigation'
  import { Button } from '$lib/components/ui/button'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import * as Sheet from '$lib/components/ui/sheet'
  import { LogIn, UserPlus, LayoutDashboard, LogOut, Menu } from '@lucide/svelte'

  const session = useSession()

  const navLinks = [
    { href: '/government', label: 'Government' },
    { href: '/history', label: 'History' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' }
  ]

  async function handleSignOut() {
    await signOut()
    await invalidateAll()
    await goto('/')
  }
</script>

<Tooltip.Provider delayDuration={300}>
  <header
    class="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
  >
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
      <!-- Brand -->
      <a href="/" class="flex items-center gap-2">
        <svg class="size-6 shrink-0" fill="none" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><clipPath id="a"><path d="m0 0h512v512h-512z"/></clipPath><g clip-path="url(#a)"><path d="m4.10511 305.072c49.05449 253.68 385.39589 276.13 486.28489 53.748-69.868-38.166-158.804.908-243.011 26.342-128.279 36.746-199.9731 8.857-243.28403-80.09z" fill="#20bbcc"/><g fill="#30d5c8"><path d="m497.023 341.398c-37.913-31.628-118.637-29.678-184.035-5.028-91.217 31.151-195.331 81.08-270.0732 6.673 78.8862 46.435 151.9822 15.235 240.2122-33.821 82.258-42.363 165.907-43.663 223.851-3.209-1.971 10.674-5.465 22.334-9.944 35.395z"/><path d="m288.706 298.579c-25.188 14.875-55.468 29.296-90.695 42.243-28.453 9.302-53.803 13.391-76.092 13.391-64.745 0-103.6732-34.528-117.60611-76.492-.07094-.187-.13186-.372-.19267-.568-.37522-1.143-.73006-2.307-1.06473-3.46-.30417-1.072-.57803-2.122-.82138-3.173-.2839-1.607-.55765-3.193-.81114-4.769-1.541401-9.796-1.794889-19.737-.932969-29.626.131862-1.461.273759-2.924.425892-4.387 7.371927-70.622 44.454907-137.752 97.741607-177.492-78.6068 79.687-74.8648 168.118-14.7137 222.269 46.4022 44.489 124.2992 53.275 204.7622 22.064z"/><path d="m406.237 83.7831c-111.388-52.827-219.089.171-259.017 33.2729 72.689-45.0464 173.531-30.2016 183.257-27.1302 144.353 39.4152 182.233 117.2222 180.697 183.2562 9.726-118.758-68.934-171.483-104.937-189.3989z"/></g><path d="m87.8792 240.654c.0041.004.0071.008.0112.012l-.0102-.01-.001-.002c-58.3544-69.839-19.0556-196.702 107.0608-232.90768 127.861-30.94702 235.76 34.92998 285.212 124.79568 5.634 10.237 13.825 28.177 15.36 33.296-25.391-48.457-78.204-97.4976-137.946-111.0872-68.079-13.6501-133.253-4.4586-194.172 38.3508-56.948 42.8294-82.5717 91.9154-75.5148 147.5524z" fill="#20bbcc"/></g></svg>
        <span class="font-semibold tracking-tight">Civitas Gaya</span>
      </a>

      <!-- Desktop Nav (centered absolutely so brand + actions stay at edges) -->
      <nav class="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
        {#each navLinks as link}
          <Button variant="ghost" size="sm" href={link.href}>{link.label}</Button>
        {/each}
      </nav>

      <!-- Right side: Auth buttons (always visible) + Hamburger (mobile only) -->
      <div class="flex items-center gap-1">
        <!-- Auth buttons (icon-only, always in header) -->
        {#if $session.data?.user}
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <Button {...props} variant="ghost" size="icon-sm" href="/dashboard">
                  <LayoutDashboard class="size-4" />
                </Button>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>Dashboard</Tooltip.Content>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <Button {...props} variant="ghost" size="icon-sm" onclick={handleSignOut}>
                  <LogOut class="size-4" />
                </Button>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>Sign out</Tooltip.Content>
          </Tooltip.Root>
        {:else if !$session.isPending}
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <Button {...props} variant="ghost" size="icon-sm" href="/auth/login">
                  <LogIn class="size-4" />
                </Button>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>Sign in</Tooltip.Content>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <Button {...props} size="icon-sm" href="/auth/register">
                  <UserPlus class="size-4" />
                </Button>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>Register</Tooltip.Content>
          </Tooltip.Root>
        {/if}

        <!-- Hamburger (mobile only) -->
        <div class="md:hidden">
          <Sheet.Root>
            <Sheet.Trigger>
              {#snippet child({ props })}
                <Button {...props} variant="ghost" size="icon-sm" aria-label="Open menu">
                  <Menu class="size-4" />
                </Button>
              {/snippet}
            </Sheet.Trigger>
            <Sheet.Content side="right" class="w-72">
              <Sheet.Header>
                <Sheet.Title>
                  <a href="/" class="font-semibold tracking-tight">Civitas Gaya</a>
                </Sheet.Title>
              </Sheet.Header>

              <nav class="mt-6 flex flex-col gap-1 px-2">
                {#each navLinks as link}
                  <Button variant="ghost" class="justify-start" href={link.href}>
                    {link.label}
                  </Button>
                {/each}
              </nav>
            </Sheet.Content>
          </Sheet.Root>
        </div>
      </div>
    </div>
  </header>
</Tooltip.Provider>
