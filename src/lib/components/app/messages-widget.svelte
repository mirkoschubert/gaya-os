<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { invalidateAll } from '$app/navigation'
  import * as Avatar from '$lib/components/ui/avatar'
  import { Button } from '$lib/components/ui/button'
  import { Textarea } from '$lib/components/ui/textarea'
  import {
    MessageSquare, X, ChevronDown, Send, Users, Building2, Lock,
    PanelLeftClose, PanelLeftOpen, Trash2, Pin, VolumeX, Eraser, ShieldAlert
  } from '@lucide/svelte'
  import type { UserChannelEntry, MessageEntry } from '$lib/domain/chat'
  import { messagesCommand } from '$lib/stores/messages'
  import { convertSmileys } from '$lib/utils/smileys'

  let {
    channels: propChannels,
    userId,
    canSendMessages = true,
    canModerateMessages = false
  }: {
    channels: UserChannelEntry[]
    userId: string
    canSendMessages?: boolean
    canModerateMessages?: boolean
  } = $props()

  let channels = $state<UserChannelEntry[]>([])
  let activeChannelId = $state<string | null>(null)
  let localUnread = $state<Record<string, number>>({})

  $effect.pre(() => {
    if (channels.length === 0 && propChannels.length > 0) {
      channels = propChannels
      activeChannelId = propChannels[0]?.channelId ?? null
      localUnread = Object.fromEntries(propChannels.map((c) => [c.channelId, c.unreadCount]))
    }
  })

  let isOpen = $state(false)
  // Start sidebar collapsed on narrow screens (detected at mount)
  let sidebarCollapsed = $state(false)
  let messagesByChannel = $state<Record<string, MessageEntry[]>>({})
  // Pinned message per channel (loaded when channel is opened)
  let pinnedByChannel = $state<Record<string, MessageEntry | null>>({})
  let messageBody = $state('')
  let messagesEl: HTMLElement | null = $state(null)
  let eventSources: Record<string, EventSource> = {}
  let isLoading = $state(false)

  // Context menu
  let contextMenu = $state<{ messageId: string; x: number; y: number } | null>(null)

  // Slash commands (only mute/clear - delete/pin are in context menu)
  const SLASH_COMMANDS = [
    { name: '/mute', hint: '[username] [minutes]', desc: 'Mute a user in this channel' },
    { name: '/clear', hint: '[n]', desc: 'Delete last n messages' }
  ]
  const slashActive = $derived(canModerateMessages && messageBody.startsWith('/'))
  const slashQuery = $derived(slashActive ? messageBody.slice(1).split(' ')[0] : '')
  const slashSuggestions = $derived(
    slashActive ? SLASH_COMMANDS.filter((c) => c.name.slice(1).startsWith(slashQuery)) : []
  )
  let slashCursorIndex = $state(0)
  $effect(() => { if (slashSuggestions.length > 0) slashCursorIndex = 0 })

  // @mention autocomplete
  interface MentionSuggestion { id: string; username: string; displayName: string; avatarUrl: string | null; isVisitor: boolean }
  let mentionSuggestions = $state<MentionSuggestion[]>([])
  let mentionQuery = $state<string | null>(null) // null = no active mention
  let mentionCursorIndex = $state(0)
  let mentionCursorPos = $state(0) // position of '@' in messageBody
  let mentionDebounce: ReturnType<typeof setTimeout> | null = null
  let textareaEl: HTMLTextAreaElement | null = $state(null)

  function getActiveMention(text: string, cursor: number): { query: string; start: number } | null {
    // Walk backwards from cursor to find '@' at word start
    let i = cursor - 1
    while (i >= 0 && /\S/.test(text[i])) i--
    const wordStart = i + 1
    if (text[wordStart] !== '@') return null
    const query = text.slice(wordStart + 1, cursor)
    // Don't trigger for email-like patterns (letter before @)
    if (wordStart > 0 && /\S/.test(text[wordStart - 1])) return null
    return { query, start: wordStart }
  }

  function onTextareaInput() {
    const cursor = textareaEl?.selectionStart ?? messageBody.length
    const mention = getActiveMention(messageBody, cursor)
    if (!mention) {
      mentionQuery = null
      mentionSuggestions = []
      return
    }
    mentionQuery = mention.query
    mentionCursorPos = mention.start
    mentionCursorIndex = 0
    if (mentionDebounce) clearTimeout(mentionDebounce)
    mentionDebounce = setTimeout(async () => {
      if (!mentionQuery || mentionQuery.length === 0) { mentionSuggestions = []; return }
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(mentionQuery)}`)
      if (res.ok) mentionSuggestions = await res.json()
    }, 200)
  }

  function insertMention(username: string) {
    const cursor = textareaEl?.selectionStart ?? messageBody.length
    const before = messageBody.slice(0, mentionCursorPos)
    const after = messageBody.slice(cursor)
    messageBody = `${before}@${username} ${after}`
    mentionQuery = null
    mentionSuggestions = []
    // Restore focus to textarea
    setTimeout(() => {
      if (textareaEl) {
        const pos = mentionCursorPos + username.length + 2 // '@' + username + ' '
        textareaEl.focus()
        textareaEl.setSelectionRange(pos, pos)
      }
    }, 0)
  }

  function renderBody(text: string): string {
    // Escape HTML first, then highlight @mentions
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const withMentions = escaped.replace(/@(\w+)/g, '<span class="font-semibold text-primary bg-primary/15 rounded px-0.5">@$1</span>')
    return convertSmileys(withMentions)
  }

  const activeChannel = $derived(channels.find((c) => c.channelId === activeChannelId) ?? null)
  const activeMessages = $derived(activeChannelId ? (messagesByChannel[activeChannelId] ?? []) : [])
  const activePinned = $derived(activeChannelId ? (pinnedByChannel[activeChannelId] ?? null) : null)
  const totalUnread = $derived(Object.values(localUnread).reduce((s, n) => s + n, 0))

  function scrollToBottom() {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight
  }

  async function loadMessages(channelId: string) {
    if (messagesByChannel[channelId]) return
    isLoading = true
    try {
      const [msgsRes, pinnedRes] = await Promise.all([
        fetch(`/api/messages/${channelId}`),
        fetch(`/api/messages/${channelId}/pinned`)
      ])
      if (msgsRes.ok) {
        messagesByChannel = { ...messagesByChannel, [channelId]: await msgsRes.json() }
        setTimeout(scrollToBottom, 0)
      }
      if (pinnedRes.ok) {
        pinnedByChannel = { ...pinnedByChannel, [channelId]: await pinnedRes.json() }
      }
    } finally {
      isLoading = false
    }
  }

  async function markRead(channelId: string) {
    localUnread = { ...localUnread, [channelId]: 0 }
    await fetch(`/api/messages/${channelId}`, { method: 'PATCH' })
  }

  function connectSSE(channelId: string) {
    if (eventSources[channelId]) return
    const es = new EventSource(`/api/messages/${channelId}/stream`)
    es.onmessage = (e) => {
      const msg: MessageEntry = JSON.parse(e.data)
      const current = messagesByChannel[channelId] ?? []
      if (!current.some((m) => m.id === msg.id)) {
        messagesByChannel = { ...messagesByChannel, [channelId]: [...current, msg] }
        if (activeChannelId === channelId && isOpen) {
          setTimeout(scrollToBottom, 0)
          markRead(channelId)
        } else {
          localUnread = { ...localUnread, [channelId]: (localUnread[channelId] ?? 0) + 1 }
        }
      }
    }
    eventSources[channelId] = es
  }

  function disconnectSSE(channelId: string) {
    eventSources[channelId]?.close()
    delete eventSources[channelId]
  }

  function disconnectAll() {
    for (const es of Object.values(eventSources)) es.close()
    eventSources = {}
  }

  async function toggleOpen() {
    isOpen = !isOpen
    contextMenu = null
    if (isOpen && activeChannelId) {
      const ch = channels.find((c) => c.channelId === activeChannelId)
      if (ch) {
        await loadMessages(ch.channelId)
        connectSSE(ch.channelId)
        markRead(ch.channelId)
      }
    }
  }

  async function switchChannel(channelId: string) {
    activeChannelId = channelId
    contextMenu = null
    await loadMessages(channelId)
    connectSSE(channelId)
    if (isOpen) markRead(channelId)
    setTimeout(scrollToBottom, 0)
  }

  async function closeChannel(channelId: string) {
    await fetch(`/api/messages/${channelId}`, { method: 'DELETE' })
    disconnectSSE(channelId)
    channels = channels.filter((c) => c.channelId !== channelId)
    const { [channelId]: _u, ...restUnread } = localUnread
    localUnread = restUnread
    if (activeChannelId === channelId) {
      activeChannelId = channels[0]?.channelId ?? null
      if (activeChannelId) {
        await loadMessages(activeChannelId)
        if (isOpen) markRead(activeChannelId)
      }
    }
  }

  async function handleSend() {
    const body = messageBody.trim()
    if (!body || !activeChannelId) return
    messageBody = ''

    if (body.startsWith('/') && canModerateMessages) {
      await handleSlashCommand(body, activeChannelId)
      return
    }

    const res = await fetch(`/api/messages/${activeChannelId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body })
    })
    if (res.ok) {
      const msg: MessageEntry = await res.json()
      const current = messagesByChannel[activeChannelId] ?? []
      if (!current.some((m) => m.id === msg.id)) {
        messagesByChannel = { ...messagesByChannel, [activeChannelId]: [...current, msg] }
      }
      setTimeout(scrollToBottom, 0)
    }
  }

  async function handleSlashCommand(command: string, channelId: string) {
    const parts = command.trim().split(/\s+/)
    const cmd = parts[0].slice(1)
    const body: Record<string, unknown> = { command: cmd }
    if (cmd === 'mute') {
      body.username = parts[1]
      body.minutes = parts[2] ? parseInt(parts[2]) : undefined
    } else if (cmd === 'clear') {
      body.count = parts[1] ? parseInt(parts[1]) : 10
    }
    await fetch(`/api/messages/${channelId}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  }

  async function moderateMessage(command: 'delete' | 'pin', messageId: string) {
    if (!activeChannelId) return
    contextMenu = null
    await fetch(`/api/messages/${activeChannelId}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, messageId })
    })
    const channelId = activeChannelId
    if (command === 'delete') {
      messagesByChannel = {
        ...messagesByChannel,
        [channelId]: (messagesByChannel[channelId] ?? []).map((m) =>
          m.id === messageId ? { ...m, deletedAt: new Date() } : m
        )
      }
      // If the deleted message was pinned, clear the pin banner
      if (pinnedByChannel[channelId]?.id === messageId) {
        pinnedByChannel = { ...pinnedByChannel, [channelId]: null }
      }
    }
    if (command === 'pin') {
      const wasAlreadyPinned = pinnedByChannel[channelId]?.id === messageId
      // Optimistically update pinned banner and message list
      const messages = messagesByChannel[channelId] ?? []
      const targetMsg = messages.find((m) => m.id === messageId)
      if (wasAlreadyPinned) {
        pinnedByChannel = { ...pinnedByChannel, [channelId]: null }
        messagesByChannel = {
          ...messagesByChannel,
          [channelId]: messages.map((m) => ({ ...m, pinned: false }))
        }
      } else {
        pinnedByChannel = { ...pinnedByChannel, [channelId]: targetMsg ? { ...targetMsg, pinned: true } : null }
        messagesByChannel = {
          ...messagesByChannel,
          [channelId]: messages.map((m) => ({ ...m, pinned: m.id === messageId }))
        }
      }
    }
  }

  function openContextMenu(e: MouseEvent | PointerEvent, messageId: string) {
    e.preventDefault()
    contextMenu = { messageId, x: e.clientX, y: e.clientY }
  }

  function insertSlashCommand(name: string) {
    messageBody = name + ' '
  }

  function handleInputKeydown(e: KeyboardEvent) {
    if (mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); mentionCursorIndex = Math.min(mentionCursorIndex + 1, mentionSuggestions.length - 1); return }
      if (e.key === 'ArrowUp') { e.preventDefault(); mentionCursorIndex = Math.max(mentionCursorIndex - 1, 0); return }
      if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); insertMention(mentionSuggestions[mentionCursorIndex].username); return }
      if (e.key === 'Escape') { mentionSuggestions = []; mentionQuery = null; return }
    }
    if (slashSuggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); slashCursorIndex = Math.min(slashCursorIndex + 1, slashSuggestions.length - 1); return }
      if (e.key === 'ArrowUp') { e.preventDefault(); slashCursorIndex = Math.max(slashCursorIndex - 1, 0); return }
      if (e.key === 'Tab') { e.preventDefault(); insertSlashCommand(slashSuggestions[slashCursorIndex].name); return }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function formatTime(d: Date | string) {
    return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  onMount(() => {
    // Start sidebar collapsed on mobile
    sidebarCollapsed = window.innerWidth < 640
    for (const ch of channels) connectSSE(ch.channelId)

    const unsub = messagesCommand.subscribe(async (cmd) => {
      if (!cmd) return
      const existing = channels.find((c) => c.channelId === cmd.channelId)
      if (existing) {
        isOpen = true
        await switchChannel(cmd.channelId)
      } else {
        await invalidateAll()
        isOpen = true
        activeChannelId = cmd.channelId
      }
      messagesCommand.set(null)
    })

    return unsub
  })

  onDestroy(disconnectAll)
</script>

<svelte:window onclick={() => { if (contextMenu) contextMenu = null }} />

<div class="fixed bottom-0 sm:bottom-4 right-0 sm:right-4 z-50 flex flex-col items-end gap-2">

  {#if isOpen}
    <div class="flex w-screen sm:w-xl lg:w-176 h-dvh sm:h-128 sm:rounded-xl border bg-background shadow-2xl overflow-hidden sm:mb-0">

      <!-- Sidebar -->
      <div class="flex flex-col shrink-0 border-r bg-muted/20 overflow-y-auto transition-all duration-200 {sidebarCollapsed ? 'w-10' : 'w-40'}">

        <div class="flex items-center justify-between px-2 py-2 shrink-0">
          {#if !sidebarCollapsed}
            <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Channels</p>
          {/if}
          <button
            onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
            class="rounded p-0.5 hover:bg-muted transition-colors text-muted-foreground ml-auto"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {#if sidebarCollapsed}
              <PanelLeftOpen class="size-3.5" />
            {:else}
              <PanelLeftClose class="size-3.5" />
            {/if}
          </button>
        </div>

        {#each channels as ch}
          {@const unread = localUnread[ch.channelId] ?? 0}
          <div class="group relative flex items-center">
            <button
              onclick={() => switchChannel(ch.channelId)}
              title={sidebarCollapsed ? ch.channelName : undefined}
              class="flex flex-1 min-w-0 items-center gap-2 py-2 text-left text-xs transition-colors
                {sidebarCollapsed ? 'justify-center px-2' : 'px-3'}
                {activeChannelId === ch.channelId
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-muted/60'}"
            >
              <span class="relative shrink-0 {activeChannelId === ch.channelId ? 'text-primary' : 'text-muted-foreground'}">
                {#if ch.type === 'DIRECT_MESSAGE'}
                  <Avatar.Root class="size-4">
                    {#if ch.otherUserAvatarUrl}
                      <Avatar.Image src={ch.otherUserAvatarUrl} alt={ch.channelName} />
                    {/if}
                    <Avatar.Fallback class="text-[8px]">{ch.channelName.charAt(0).toUpperCase()}</Avatar.Fallback>
                  </Avatar.Root>
                {:else if ch.type === 'CITIZEN_GENERAL'}
                  <Users class="size-3.5" />
                {:else if ch.type === 'COUNCIL_INTERNAL'}
                  <Lock class="size-3.5" />
                {:else}
                  <Building2 class="size-3.5" />
                {/if}
                {#if sidebarCollapsed && unread > 0 && activeChannelId !== ch.channelId}
                  <span class="absolute -top-1 -right-1 flex size-3 items-center justify-center rounded-full bg-destructive text-[7px] font-bold text-destructive-foreground">
                    {unread > 9 ? '9' : unread}
                  </span>
                {/if}
              </span>
              {#if !sidebarCollapsed}
                <span class="truncate leading-tight">{ch.channelName}</span>
                {#if unread > 0 && activeChannelId !== ch.channelId}
                  <span class="ml-auto shrink-0 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                    {unread > 9 ? '9+' : unread}
                  </span>
                {/if}
              {/if}
            </button>
            {#if ch.closeable && !sidebarCollapsed}
              <button
                onclick={() => closeChannel(ch.channelId)}
                class="absolute right-1 hidden group-hover:flex size-4 items-center justify-center rounded hover:bg-muted transition-colors"
                aria-label="Close channel"
              >
                <X class="size-3 text-muted-foreground" />
              </button>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Main area -->
      <div class="flex flex-col flex-1 min-w-0">

        <!-- Header -->
        <div class="flex items-center justify-between px-3 py-2 border-b bg-muted/30 shrink-0">
          <span class="text-sm font-semibold truncate">
            {activeChannel?.channelName ?? 'Messages'}
          </span>
          <button onclick={toggleOpen} class="rounded p-1 hover:bg-muted transition-colors shrink-0">
            <ChevronDown class="size-4" />
          </button>
        </div>

        <!-- Pinned message banner -->
        {#if activePinned}
          <div class="flex items-center gap-2 px-3 py-1.5 border-b bg-yellow-50 dark:bg-yellow-950/30 shrink-0">
            <Pin class="size-3 shrink-0 text-yellow-600 dark:text-yellow-400" />
            <p class="flex-1 truncate text-xs text-yellow-800 dark:text-yellow-300">
              <span class="font-medium">{activePinned.authorName}:</span>
              {@html renderBody(activePinned.body)}
            </p>
            {#if canModerateMessages}
              <button
                onclick={() => moderateMessage('pin', activePinned!.id)}
                class="shrink-0 rounded p-0.5 hover:bg-yellow-200 dark:hover:bg-yellow-900 transition-colors text-yellow-600 dark:text-yellow-400"
                aria-label="Unpin message"
              >
                <X class="size-3" />
              </button>
            {/if}
          </div>
        {/if}

        <!-- Messages -->
        <div bind:this={messagesEl} class="flex-1 overflow-y-auto px-3 py-2 space-y-3 min-h-0">
          {#if isLoading}
            <p class="text-xs text-muted-foreground text-center py-4">Loading...</p>
          {:else if activeMessages.length === 0}
            <p class="text-xs text-muted-foreground text-center py-4">No messages yet.</p>
          {:else}
            {#each activeMessages as message (message.id)}
              {#if !message.deletedAt}
                {@const isOwn = message.authorId === userId}
                <div
                  role="listitem"
                  class="flex items-start gap-2 rounded-md px-1 py-0.5 -mx-1 transition-colors {canModerateMessages ? 'hover:bg-muted/40 cursor-default' : ''}"
                  oncontextmenu={canModerateMessages ? (e) => openContextMenu(e, message.id) : undefined}
                >
                  <Avatar.Root class="size-6 shrink-0 mt-0.5">
                    {#if message.authorAvatarUrl}
                      <Avatar.Image src={message.authorAvatarUrl} alt={message.authorName} />
                    {/if}
                    <Avatar.Fallback class="text-[9px]">{message.authorName.charAt(0).toUpperCase()}</Avatar.Fallback>
                  </Avatar.Root>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-baseline gap-1.5 mb-0.5">
                      <span class="text-xs font-semibold {isOwn ? 'text-primary' : ''} truncate">
                        {message.authorName}
                      </span>
                      {#if message.authorIsVisitor}
                        <span class="inline-flex items-center gap-0.5 rounded px-1 py-px text-[9px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 shrink-0">
                          <ShieldAlert class="size-2.5" />
                          Visitor
                        </span>
                      {/if}
                      <span class="text-[10px] text-muted-foreground shrink-0 ml-auto">{formatTime(message.createdAt)}</span>
                    </div>
                    <div class="text-sm leading-snug {message.pinned ? 'rounded px-1.5 py-0.5 bg-yellow-50 dark:bg-yellow-950/30 ring-1 ring-yellow-300 dark:ring-yellow-700' : ''}">
                      {@html renderBody(message.body)}
                    </div>
                  </div>
                </div>
              {/if}
            {/each}
          {/if}
        </div>

        <!-- Input (hidden for readonly visitors) -->
        {#if !canSendMessages}
          <p class="px-3 py-2 border-t text-xs text-muted-foreground text-center shrink-0">
            You can read messages but cannot send any.
          </p>
        {/if}
        <div class="relative {canSendMessages ? 'flex' : 'hidden'} gap-2 px-3 py-2 border-t shrink-0">
          {#if mentionSuggestions.length > 0}
            <div class="absolute bottom-full left-3 right-3 mb-1 rounded-lg border bg-popover shadow-lg overflow-hidden z-10">
              {#each mentionSuggestions as suggestion, i}
                <button
                  onclick={() => insertMention(suggestion.username)}
                  class="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors {i === mentionCursorIndex ? 'bg-muted' : ''}"
                >
                  <Avatar.Root class="size-5 shrink-0">
                    {#if suggestion.avatarUrl}
                      <Avatar.Image src={suggestion.avatarUrl} alt={suggestion.displayName} />
                    {/if}
                    <Avatar.Fallback class="text-[8px]">{suggestion.displayName.charAt(0).toUpperCase()}</Avatar.Fallback>
                  </Avatar.Root>
                  <span class="font-medium">@{suggestion.username}</span>
                  {#if suggestion.displayName !== suggestion.username}
                    <span class="text-muted-foreground">{suggestion.displayName}</span>
                  {/if}
                  {#if suggestion.isVisitor}
                    <span class="ml-auto text-[9px] font-medium text-amber-600">Visitor</span>
                  {/if}
                </button>
              {/each}
            </div>
          {:else if slashSuggestions.length > 0}
            <div class="absolute bottom-full left-3 right-3 mb-1 rounded-lg border bg-popover shadow-lg overflow-hidden">
              {#each slashSuggestions as suggestion, i}
                <button
                  onclick={() => insertSlashCommand(suggestion.name)}
                  class="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors {i === slashCursorIndex ? 'bg-muted' : ''}"
                >
                  <span class="font-mono font-semibold text-primary">{suggestion.name}</span>
                  <span class="text-muted-foreground">{suggestion.hint}</span>
                  <span class="ml-auto text-muted-foreground">{suggestion.desc}</span>
                </button>
              {/each}
            </div>
          {/if}
          <Textarea
            bind:ref={textareaEl}
            bind:value={messageBody}
            placeholder="Message..."
            rows={1}
            class="resize-none flex-1 text-sm min-h-0 py-1.5"
            onkeydown={handleInputKeydown}
            oninput={onTextareaInput}
          />
          <Button
            size="icon"
            class="size-8 shrink-0 self-end"
            disabled={!messageBody.trim()}
            onclick={handleSend}
          >
            <Send class="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Toggle button: hidden on mobile when panel is open -->
  <button
    onclick={toggleOpen}
    class="relative items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors mr-4 sm:mr-0 {isOpen ? 'hidden sm:flex' : 'flex'}"
  >
    {#if isOpen}
      <X class="size-4" />
      Close
    {:else}
      <MessageSquare class="size-4" />
      Messages
      {#if totalUnread > 0}
        <span class="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          {totalUnread > 9 ? '9+' : totalUnread}
        </span>
      {/if}
    {/if}
  </button>
</div>

<!-- Floating context menu -->
{#if contextMenu && canModerateMessages}
  {@const menuId = contextMenu.messageId}
  {@const isPinned = pinnedByChannel[activeChannelId ?? '']?.id === menuId}
  <div
    role="menu"
    tabindex="-1"
    class="fixed z-60 rounded-lg border bg-popover shadow-xl overflow-hidden min-w-40"
    style="left: {Math.min(contextMenu.x, window.innerWidth - 176)}px; top: {Math.min(contextMenu.y, window.innerHeight - 160)}px;"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => { if (e.key === 'Escape') contextMenu = null }}
  >
    <button
      onclick={() => moderateMessage('pin', menuId)}
      class="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
    >
      <Pin class="size-3.5 text-muted-foreground" />
      {isPinned ? 'Unpin' : 'Pin message'}
    </button>
    <button
      onclick={() => moderateMessage('delete', menuId)}
      class="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-destructive"
    >
      <Trash2 class="size-3.5" />
      Delete message
    </button>
    <div class="border-t"></div>
    <button
      onclick={() => {
        const msg = activeMessages.find((m) => m.id === menuId)
        if (msg) messageBody = `/mute ${msg.authorUsername ?? ''} `
        contextMenu = null
      }}
      class="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-destructive"
    >
      <VolumeX class="size-3.5" />
      Mute user...
    </button>
    <button
      onclick={() => { messageBody = '/clear '; contextMenu = null }}
      class="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-destructive"
    >
      <Eraser class="size-3.5" />
      Clear messages...
    </button>
  </div>
{/if}
