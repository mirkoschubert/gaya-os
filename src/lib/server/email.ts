import { Resend } from 'resend'
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '$env/static/private'

const resend = new Resend(RESEND_API_KEY)

// Verified domain: updates.civitasgaya.org
// Without RESEND_FROM_EMAIL set, falls back to Resend test mode (onboarding@resend.dev),
// which only delivers to the Resend account email.
const fromEmail = RESEND_FROM_EMAIL || 'Gaya OS <onboarding@resend.dev>'

export async function sendVerificationEmail({
  to,
  url
}: {
  to: string
  url: string
}) {
  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject: 'Verify your email – Gaya OS',
    html: `
      <p>Welcome to Gaya OS!</p>
      <p>Please click the link below to verify your email address:</p>
      <p><a href="${url}">${url}</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you did not create an account, you can safely ignore this email.</p>
    `
  })

  if (error) {
    console.error('[Resend] Failed to send verification email:', error)
    throw new Error(`Email delivery failed: ${error.message}`)
  }

  console.log('[Resend] Verification email sent, id:', data?.id)
}
