import { error, json } from '@sveltejs/kit'
import { put } from '@vercel/blob'
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private'
import type { RequestHandler } from './$types'

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')
  if (locals.user.civicStatus !== 'CITIZEN' && locals.user.role !== 'ADMIN') {
    error(403, 'Only citizens can upload post media')
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) error(400, 'No file provided')
  if (!ALLOWED_TYPES.includes(file.type)) error(400, 'Invalid file type. Use JPG, PNG, WebP, MP4, or WebM.')
  if (file.size > MAX_SIZE) error(400, 'File too large. Maximum size is 10 MB.')

  const ext = file.name.split('.').pop() ?? 'bin'
  const filename = `post-media/${crypto.randomUUID()}.${ext}`

  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: false,
    token: BLOB_READ_WRITE_TOKEN
  })

  return json({ url: blob.url })
}
