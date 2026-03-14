import { Resend } from 'resend'
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '$env/static/private'

const resend = new Resend(RESEND_API_KEY)

// Without a verified domain, Resend only allows sending from onboarding@resend.dev
// and only to the email address registered with your Resend account.
// Once you verify a domain, update RESEND_FROM_EMAIL to e.g. "Gaya OS <noreply@yourdomain.com>"
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
