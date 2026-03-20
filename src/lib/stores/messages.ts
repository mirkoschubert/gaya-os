import { writable } from 'svelte/store'

export interface MessagesWidgetCommand {
  action: 'open' | 'switch'
  channelId: string
}

export const messagesCommand = writable<MessagesWidgetCommand | null>(null)
