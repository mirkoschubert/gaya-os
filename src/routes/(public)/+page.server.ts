import { prisma } from '$lib/server/prisma'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  const parentData = await parent()

  const activeVersion = await prisma.documentVersion.findFirst({
    where: {
      status: 'ACTIVE',
      document: { type: 'CONSTITUTION' }
    },
    select: { versionLabel: true }
  })

  return {
    ...parentData,
    constitutionVersion: activeVersion?.versionLabel ?? null
  }
}
