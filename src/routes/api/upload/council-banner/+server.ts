import { error, json } from '@sveltejs/kit'
import { put } from '@vercel/blob'
import { prisma } from '$lib/server/prisma'
import { getCouncilMembershipsForUser } from '$lib/server/services/councils'
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private'
import type { RequestHandler } from './$types'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')

  const formData = await request.formData()
  const file = formData.get('file')
  const councilId = formData.get('councilId') as string | null

  if (!(file instanceof File)) error(400, 'No file provided')
  if (!councilId) error(400, 'No councilId provided')

  // Must be a council member or admin
  const memberships = await getCouncilMembershipsForUser(locals.user.id)
  const isMember = memberships.some((m) => m.councilId === councilId)
  if (!isMember && locals.user.role !== 'ADMIN') error(403, 'Forbidden')

  if (!ALLOWED_TYPES.includes(file.type)) error(400, 'Invalid file type. Use JPG, PNG, or WebP.')
  if (file.size > MAX_SIZE) error(400, 'File too large. Maximum size is 5 MB.')

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `council-banners/${councilId}.${ext}`

  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    token: BLOB_READ_WRITE_TOKEN
  })

  const urlWithBust = `${blob.url}?t=${Date.now()}`

  await prisma.council.update({
    where: { id: councilId },
    data: { banner: urlWithBust }
  })

  return json({ url: urlWithBust })
}
