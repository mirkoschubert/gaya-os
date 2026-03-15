/**
 * Returns the app's base URL — automatically determined from environment:
 * - On Vercel: https://<VERCEL_PROJECT_PRODUCTION_URL> (stable primary domain)
 * - Locally:   http://localhost:<PORT> (defaults to 5173)
 *
 * VERCEL_PROJECT_PRODUCTION_URL is the stable domain (e.g. gaya-os.vercel.app),
 * while VERCEL_URL is deployment-specific (e.g. gaya-os-abc123.vercel.app) and
 * would cause Better Auth origin validation to fail.
 */
export function getBaseUrl(): string {
	if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
		return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
	}
	return `http://localhost:${process.env.PORT ?? '5173'}`
}
