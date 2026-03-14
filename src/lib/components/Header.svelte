<script lang="ts">
  import { signOut, useSession } from '$lib/auth-client'
  import { goto, invalidateAll } from '$app/navigation'
  import { Button } from '$lib/components/ui/button'

  const session = useSession()

  async function handleSignOut() {
    await signOut()
    await invalidateAll()
    await goto('/')
  }
</script>

<header
  class="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
>
  <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
    <a href="/" class="flex items-center gap-2">
      <span class="font-semibold tracking-tight">Gaya</span>
      <span class="text-muted-foreground text-sm font-normal">OS</span>
    </a>

    <nav class="flex items-center gap-1">
      <Button variant="ghost" size="sm" href="/about">About</Button>

      {#if $session.data?.user}
        <Button variant="ghost" size="sm" href="/dashboard">Dashboard</Button>
        <Button variant="ghost" size="sm" onclick={handleSignOut}
          >Sign out</Button
        >
      {:else if !$session.isPending}
        <Button variant="ghost" size="sm" href="/auth/login">Sign in</Button>
        <Button size="sm" href="/auth/register">Register</Button>
      {/if}
    </nav>
  </div>
</header>
