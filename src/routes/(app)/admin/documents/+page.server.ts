import { error, fail, redirect } from '@sveltejs/kit'
import { listDocuments, createDocument, constitutionExists } from '$lib/server/services/documents'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')

  const [documents, hasConstitution] = await Promise.all([
    listDocuments(),
    constitutionExists()
  ])

  return { documents, hasConstitution }
}

export const actions: Actions = {
  createDocument: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')

    const form = await request.formData()
    const title = (form.get('title') as string)?.trim()
    const type = form.get('type') as string
    const slug = (form.get('slug') as string)?.trim()

    if (!title) return fail(400, { error: 'Title is required.' })
    if (!type || !['CONSTITUTION', 'POLICY', 'PROCEDURE'].includes(type)) {
      return fail(400, { error: 'Invalid document type.' })
    }
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return fail(400, { error: 'Slug must be lowercase letters, numbers, and hyphens only.' })
    }

    if (type === 'CONSTITUTION') {
      const exists = await constitutionExists()
      if (exists) return fail(400, { error: 'A Constitution already exists. Only one is allowed.' })
    }

    let doc
    try {
      doc = await createDocument(
        { title, type: type as 'CONSTITUTION' | 'POLICY' | 'PROCEDURE', slug },
        locals.user.id
      )
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.'
      return fail(400, { error: message })
    }
    redirect(302, `/admin/documents/${doc.slug}/versions/new`)
  }
}
