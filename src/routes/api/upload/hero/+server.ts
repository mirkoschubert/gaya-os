import { error, json } from '@sveltejs/kit'
import { put } from '@vercel/blob'
import { prisma } from '$lib/server/prisma'
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private'
import type { RequestHandler } from './$types'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) error(400, 'No file provided')
  if (!ALLOWED_TYPES.includes(file.type)) error(400, 'Invalid file type. Use JPG, PNG, or WebP.')
  if (file.size > MAX_SIZE) error(400, 'File too large. Maximum size is 5 MB.')

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `heroes/${locals.user.id}.${ext}`

  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    token: BLOB_READ_WRITE_TOKEN
  })

  const urlWithBust = `${blob.url}?t=${Date.now()}`

  await prisma.user.update({
    where: { id: locals.user.id },
    data: { heroUrl: urlWithBust }
  })

  return json({ url: urlWithBust })
}
