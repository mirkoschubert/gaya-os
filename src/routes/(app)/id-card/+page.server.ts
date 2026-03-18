import { redirect, fail, error } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import {
  submitCitizenshipApplication,
  getApplicationByUserId
} from '$lib/server/services/citizenship'
import { getAllSettings } from '$lib/server/services/settings'
import { hasCapability } from '$lib/server/services/roles'
import type { RequestContext } from '$lib/server/services/citizenship'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/auth/login')

  let application = null
  if (locals.user.civicStatus === 'VISITOR') {
    application = await getApplicationByUserId(locals.user.id)
  }

  const settings = await getAllSettings()

  return {
    user: locals.user,
    application,
    motivationMinChars: settings.citizenship.motivationMinChars
  }
}

export const actions: Actions = {
  submit: async ({ locals, request, getClientAddress }) => {
    if (!locals.user) redirect(302, '/auth/login')
    if (!(await hasCapability(locals.user, 'can_apply_citizenship'))) error(403, 'Forbidden')

    const data = await request.formData()

    const firstName = (data.get('firstName') as string)?.trim()
    const middleNames = (data.get('middleNames') as string)?.trim() || undefined
    const lastName = (data.get('lastName') as string)?.trim()
    const country = (data.get('country') as string)?.trim()
    const city = (data.get('city') as string)?.trim()
    const motivationText = (data.get('motivationText') as string)?.trim()
    const fingerprintId = (data.get('fingerprintId') as string)?.trim() || undefined
    const constitutionAcknowledged = data.get('constitutionAcknowledged') === 'on'

    // Server-side validation
    if (!constitutionAcknowledged) {
      return fail(400, { error: 'You must acknowledge the constitution.' })
    }
    if (!firstName || firstName.length < 1 || firstName.length > 60) {
      return fail(400, { error: 'First name must be between 1 and 60 characters.' })
    }
    if (!lastName || lastName.length < 1 || lastName.length > 60) {
      return fail(400, { error: 'Last name must be between 1 and 60 characters.' })
    }
    if (!country) {
      return fail(400, { error: 'Country is required.' })
    }
    if (!city || city.length < 1) {
      return fail(400, { error: 'City is required.' })
    }

    const settings = await getAllSettings()
    if (!motivationText || motivationText.length < settings.citizenship.motivationMinChars) {
      return fail(400, {
        error: `Motivation text must be at least ${settings.citizenship.motivationMinChars} characters.`
      })
    }

    let ipAddress: string | null = null
    try {
      ipAddress = getClientAddress()
    } catch {
      // Not available in all environments (e.g. dev without adapter)
    }

    const context: RequestContext = {
      ipAddress,
      userAgent: request.headers.get('user-agent'),
      fingerprintId
    }

    try {
      await submitCitizenshipApplication(
        locals.user.id,
        { firstName, middleNames, lastName, country, city: city!, motivationText },
        context
      )
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.'
      return fail(400, { error: message })
    }

    // Return success state — page renders "pending" view
    return { submitted: true }
  }
}
