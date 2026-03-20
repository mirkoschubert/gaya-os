import { error, redirect } from '@sveltejs/kit'
import { reviewProposal, getProposalForReview } from '$lib/server/services/councils'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals, parent }) => {
  const { councilMemberships } = await parent()

  const isMember = councilMemberships.some((m) => m.councilId === params.id)
  if (!isMember && locals.user!.role !== 'ADMIN') {
    error(403, 'Access denied')
  }

  const proposal = await getProposalForReview(params.proposalId)
  if (!proposal) error(404, 'Proposal not found')

  const membership = councilMemberships.find((m) => m.councilId === params.id)

  return {
    proposal,
    councilId: params.id,
    breadcrumbs: [
      { label: 'Council', href: '/council' },
      { label: membership?.councilName ?? 'Council', href: `/council/${params.id}` },
      { label: 'Review Proposals', href: `/council/${params.id}/proposals` },
      { label: proposal.title }
    ]
  }
}

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    const form = await request.formData()
    const decision = form.get('decision')?.toString()
    const note = form.get('note')?.toString().trim() || null

    if (decision !== 'READY_FOR_VOTE' && decision !== 'DISCUSSION') {
      return { error: 'Invalid decision.' }
    }

    await reviewProposal({
      councilId: params.id,
      proposalId: params.proposalId,
      decision,
      note,
      reviewerId: locals.user!.id
    })

    redirect(302, `/council/${params.id}/proposals`)
  }
}
