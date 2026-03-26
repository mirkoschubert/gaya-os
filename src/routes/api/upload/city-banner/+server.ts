import { error, json } from '@sveltejs/kit'
import { put } from '@vercel/blob'
import { prisma } from '$lib/server/prisma'
import { hasCapability } from '$lib/server/services/roles'
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private'
import type { RequestHandler } from './$types'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')
  if (!(await hasCapability(locals.user, 'can_manage_cities'))) error(403, 'Forbidden')

  const formData = await request.formData()
  const file = formData.get('file')
  const cityId = formData.get('cityId') as string | null

  if (!(file instanceof File)) error(400, 'No file provided')
  if (!cityId) error(400, 'No cityId provided')
  if (!ALLOWED_TYPES.includes(file.type)) error(400, 'Invalid file type. Use JPG, PNG, or WebP.')
  if (file.size > MAX_SIZE) error(400, 'File too large. Maximum size is 5 MB.')

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `city-banners/${cityId}.${ext}`

  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    token: BLOB_READ_WRITE_TOKEN
  })

  const urlWithBust = `${blob.url}?t=${Date.now()}`

  await prisma.city.update({
    where: { id: cityId },
    data: { banner: urlWithBust }
  })

  return json({ url: urlWithBust })
}
