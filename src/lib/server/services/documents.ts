import { prisma } from '$lib/server/prisma'
import { logAction } from './audit'
import { isValidVersionLabel } from '$lib/domain/documents'
import type {
  DocumentSummary,
  DocumentDetail,
  DocumentVersionMeta,
  DocumentVersionDetail,
  DocumentType
} from '$lib/domain/documents'

const VERSION_AUTHOR_SELECT = {
  id: true,
  name: true,
  username: true
} as const

const VERSION_META_SELECT = {
  id: true,
  versionLabel: true,
  status: true,
  changelog: true,
  createdAt: true,
  createdBy: { select: VERSION_AUTHOR_SELECT }
} as const

export async function listDocuments(): Promise<DocumentSummary[]> {
  const docs = await prisma.document.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      versions: {
        where: { status: 'ACTIVE' },
        select: VERSION_META_SELECT,
        take: 1
      }
    }
  })

  return docs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    type: doc.type as DocumentType,
    slug: doc.slug,
    createdAt: doc.createdAt,
    activeVersion: doc.versions[0]
      ? {
          ...doc.versions[0],
          status: doc.versions[0].status as DocumentVersionMeta['status']
        }
      : null
  }))
}

export async function getDocumentBySlug(slug: string): Promise<DocumentDetail | null> {
  const doc = await prisma.document.findUnique({
    where: { slug },
    include: {
      versions: {
        where: { status: 'ACTIVE' },
        select: { ...VERSION_META_SELECT, content: true },
        take: 1
      }
    }
  })

  if (!doc) return null

  const active = doc.versions[0] ?? null

  return {
    id: doc.id,
    title: doc.title,
    type: doc.type as DocumentType,
    slug: doc.slug,
    createdAt: doc.createdAt,
    activeVersion: active
      ? {
          id: active.id,
          versionLabel: active.versionLabel,
          status: active.status as DocumentVersionMeta['status'],
          changelog: active.changelog,
          createdAt: active.createdAt,
          createdBy: active.createdBy
        }
      : null,
    activeContent: active?.content ?? null
  }
}

export async function listDocumentVersions(
  documentId: string
): Promise<(DocumentVersionMeta & { prevVersionLabel: string | null })[]> {
  const versions = await prisma.documentVersion.findMany({
    where: { documentId },
    orderBy: { createdAt: 'desc' },
    select: VERSION_META_SELECT
  })

  return versions.map((v, i) => ({
    ...v,
    status: v.status as DocumentVersionMeta['status'],
    // Next item in descending list = the chronologically previous version
    prevVersionLabel: versions[i + 1]?.versionLabel ?? null
  }))
}

export async function getDocumentVersion(
  slug: string,
  versionLabel: string
): Promise<(DocumentVersionDetail & { prevVersionLabel: string | null }) | null> {
  const doc = await prisma.document.findUnique({
    where: { slug },
    include: {
      versions: {
        orderBy: { createdAt: 'asc' },
        select: { ...VERSION_META_SELECT, content: true }
      }
    }
  })

  if (!doc) return null

  const idx = doc.versions.findIndex((v) => v.versionLabel === versionLabel)
  if (idx === -1) return null

  const v = doc.versions[idx]
  const prev = idx > 0 ? doc.versions[idx - 1] : null

  return {
    id: v.id,
    versionLabel: v.versionLabel,
    status: v.status as DocumentVersionMeta['status'],
    changelog: v.changelog,
    createdAt: v.createdAt,
    createdBy: v.createdBy,
    content: v.content,
    documentId: doc.id,
    documentSlug: doc.slug,
    documentTitle: doc.title,
    prevVersionLabel: prev?.versionLabel ?? null
  }
}

export async function constitutionExists(): Promise<boolean> {
  const count = await prisma.document.count({ where: { type: 'CONSTITUTION' } })
  return count > 0
}

export async function createDocument(
  data: { title: string; type: DocumentType; slug: string },
  _actorId: string
): Promise<{ id: string; slug: string }> {
  const doc = await prisma.document.create({
    data: {
      title: data.title,
      type: data.type,
      slug: data.slug
    }
  })

  return { id: doc.id, slug: doc.slug }
}

export async function createDocumentVersion(
  documentId: string,
  data: { content: string; changelog?: string; versionLabel: string },
  actorId: string
): Promise<{ id: string; versionLabel: string }> {
  if (!isValidVersionLabel(data.versionLabel)) {
    throw new Error(`Invalid version label: "${data.versionLabel}". Use MAJOR.MINOR.PATCH format.`)
  }

  const version = await prisma.documentVersion.create({
    data: {
      documentId,
      versionLabel: data.versionLabel,
      content: data.content,
      changelog: data.changelog ?? null,
      status: 'DRAFT',
      createdById: actorId
    }
  })

  return { id: version.id, versionLabel: version.versionLabel }
}

export async function publishDocumentVersion(
  documentId: string,
  versionId: string,
  actorId: string
): Promise<void> {
  const doc = await prisma.document.findUniqueOrThrow({
    where: { id: documentId },
    select: { slug: true, title: true }
  })

  const targetVersion = await prisma.documentVersion.findUniqueOrThrow({
    where: { id: versionId },
    select: { versionLabel: true, status: true }
  })

  await prisma.$transaction([
    prisma.documentVersion.updateMany({
      where: { documentId, status: 'ACTIVE' },
      data: { status: 'ARCHIVED' }
    }),
    prisma.documentVersion.update({
      where: { id: versionId },
      data: { status: 'ACTIVE' }
    })
  ])

  await logAction({
    userId: actorId,
    action: 'DOCUMENT_VERSION_CREATED',
    entityType: 'DOCUMENT',
    entityId: documentId,
    metadata: {
      documentSlug: doc.slug,
      documentTitle: doc.title,
      versionId,
      versionLabel: targetVersion.versionLabel
    }
  })
}

export async function deleteDocument(documentId: string, actorId: string): Promise<void> {
  const doc = await prisma.document.findUniqueOrThrow({
    where: { id: documentId },
    select: { slug: true, title: true }
  })

  await prisma.$transaction([
    prisma.documentVersion.deleteMany({ where: { documentId } }),
    prisma.document.delete({ where: { id: documentId } })
  ])

  await logAction({
    userId: actorId,
    action: 'DOCUMENT_DELETED',
    entityType: 'DOCUMENT',
    entityId: documentId,
    metadata: { documentSlug: doc.slug, title: doc.title }
  })
}
