import { prisma } from '$lib/server/prisma'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const doc = await prisma.document.findFirst({
    where: { type: 'CONSTITUTION' },
    include: {
      versions: {
        where: { status: 'ACTIVE' },
        take: 1,
        select: {
          versionLabel: true,
          content: true,
          changelog: true,
          createdAt: true,
          createdBy: { select: { id: true, name: true, username: true } }
        }
      }
    }
  })

  if (!doc || !doc.versions[0]) {
    return { constitution: null }
  }

  const v = doc.versions[0]
  return {
    constitution: {
      title: doc.title,
      slug: doc.slug,
      versionLabel: v.versionLabel,
      content: v.content,
      changelog: v.changelog,
      createdAt: v.createdAt,
      createdBy: v.createdBy
    }
  }
}
