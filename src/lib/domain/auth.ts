export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN'
export type CivicStatus = 'VISITOR' | 'CITIZEN'

export interface ProfileLink {
  label: string // platform key, e.g. 'bluesky'
  url: string   // raw value: full URL, handle, or identifier depending on platform
}

export interface LinkType {
  value: string
  label: string
  iconKey: string         // icon key for SocialIcon component, e.g. 'bluesky'
  placeholder: string     // shown in input field
  inputLabel: string      // describes what to enter
  linkable: boolean       // false = display-only (no href)
  // builds the href from the raw value; null = use raw value as-is (already a URL)
  buildHref: ((value: string) => string | null) | null
}

export const LINK_TYPES: LinkType[] = [
  {
    value: 'website',
    label: 'Website',
    iconKey: 'xbrowser',
    placeholder: 'https://example.com',
    inputLabel: 'URL',
    linkable: true,
    buildHref: null,
  },
  {
    value: 'bluesky',
    label: 'Bluesky',
    iconKey: 'bluesky',
    placeholder: '@you.bsky.social',
    inputLabel: 'Handle (e.g. @you.bsky.social)',
    linkable: true,
    buildHref: (v) => {
      const handle = v.replace(/^@/, '').trim()
      return handle ? `https://bsky.app/profile/${handle}` : null
    },
  },
  {
    value: 'mastodon',
    label: 'Mastodon',
    iconKey: 'mastodon',
    placeholder: '@you@instance.social',
    inputLabel: 'Handle (e.g. @you@instance.social)',
    linkable: true,
    buildHref: (v) => {
      // @user@instance.social -> https://instance.social/@user
      const m = v.replace(/^@/, '').match(/^([^@]+)@(.+)$/)
      return m ? `https://${m[2]}/@${m[1]}` : null
    },
  },
  {
    value: 'matrix',
    label: 'Matrix / Element',
    iconKey: 'element',
    placeholder: '@you:matrix.org',
    inputLabel: 'Matrix ID (e.g. @you:matrix.org)',
    linkable: true,
    buildHref: (v) => {
      const id = v.startsWith('@') ? v : `@${v}`
      return `https://matrix.to/#/${id}`
    },
  },
  {
    value: 'xmpp',
    label: 'XMPP',
    iconKey: 'xmpp',
    placeholder: 'you@jabber.org',
    inputLabel: 'JID (e.g. you@jabber.org)',
    linkable: false,
    buildHref: null,
  },
  {
    value: 'signal',
    label: 'Signal',
    iconKey: 'signal',
    placeholder: 'signal.me/u/... or username',
    inputLabel: 'Signal username or signal.me link',
    linkable: true,
    buildHref: (v) => {
      if (v.startsWith('http')) return v
      return `https://signal.me/#p/${v}`
    },
  },
  {
    value: 'peertube',
    label: 'PeerTube',
    iconKey: 'peertube',
    placeholder: '@you@instance.tv',
    inputLabel: 'Handle (e.g. @you@peertube.tv)',
    linkable: true,
    buildHref: (v) => {
      const m = v.replace(/^@/, '').match(/^([^@]+)@(.+)$/)
      return m ? `https://${m[2]}/@${m[1]}` : null
    },
  },
  {
    value: 'misskey',
    label: 'Misskey / Calckey',
    iconKey: 'misskey',
    placeholder: '@you@misskey.io',
    inputLabel: 'Handle (e.g. @you@misskey.io)',
    linkable: true,
    buildHref: (v) => {
      const m = v.replace(/^@/, '').match(/^([^@]+)@(.+)$/)
      return m ? `https://${m[2]}/@${m[1]}` : null
    },
  },
  {
    value: 'diaspora',
    label: 'Diaspora',
    iconKey: 'diaspora',
    placeholder: 'you@pod.example.com',
    inputLabel: 'Handle (e.g. you@joindiaspora.com)',
    linkable: true,
    buildHref: (v) => {
      const handle = v.replace(/^@/, '').trim()
      const m = handle.match(/^([^@]+)@(.+)$/)
      return m ? `https://${m[2]}/u/${m[1]}` : null
    },
  },
  {
    value: 'funkwhale',
    label: 'Funkwhale',
    iconKey: 'funkwhale',
    placeholder: '@you@open.audio',
    inputLabel: 'Handle (e.g. @you@open.audio)',
    linkable: true,
    buildHref: (v) => {
      const m = v.replace(/^@/, '').match(/^([^@]+)@(.+)$/)
      return m ? `https://${m[2]}/@${m[1]}` : null
    },
  },
  {
    value: 'briar',
    label: 'Briar',
    iconKey: 'briar',
    placeholder: 'briar:// link or nickname',
    inputLabel: 'Briar link or nickname',
    linkable: false,
    buildHref: null,
  },
  {
    value: 'email',
    label: 'E-Mail',
    iconKey: 'fairemail',
    placeholder: 'you@example.com',
    inputLabel: 'E-mail address',
    linkable: true,
    buildHref: (v) => `mailto:${v.trim()}`,
  },
  {
    value: 'other',
    label: 'Other',
    iconKey: 'xbrowser',
    placeholder: 'https://...',
    inputLabel: 'URL',
    linkable: true,
    buildHref: null,
  },
]

export function getLinkHref(type: string, value: string): string | null {
  const def = LINK_TYPES.find((t) => t.value === type)
  if (!def || !def.linkable) return null
  if (def.buildHref) return def.buildHref(value)
  return value || null
}

export interface AppUser {
  id: string
  email: string
  name: string // computed: `${firstName} ${lastName}`
  firstName: string
  lastName: string
  username: string | null
  displayUsername: string | null
  role: UserRole
  civicStatus: CivicStatus
  citizenId: string | null
  joinedAt: Date | null
  createdAt: Date
  // Profile fields
  bio: string | null
  location: string | null
  locationCity: string | null
  locationCountry: string | null
  links: ProfileLink[] | null
  avatarUrl: string | null
  heroUrl: string | null
  showRealName: boolean
}
