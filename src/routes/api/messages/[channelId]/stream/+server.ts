import { error } from '@sveltejs/kit'
import { assertChannelAccess, streamMessages } from '$lib/server/services/messages'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')

  await assertChannelAccess(params.channelId, locals.user.id)

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      // Send a heartbeat comment every 15s to keep the connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          clearInterval(heartbeat)
        }
      }, 15000)

      try {
        for await (const message of streamMessages(params.channelId)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
        }
      } finally {
        clearInterval(heartbeat)
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  })
}
