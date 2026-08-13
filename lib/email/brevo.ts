import 'server-only'

interface SendEmailInput {
  to: string
  subject: string
  html: string
}

export function isBrevoConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY?.trim() && process.env.BREVO_SENDER_EMAIL?.trim())
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim()

  if (!apiKey || !senderEmail) {
    throw new Error('Brevo is not configured')
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'SKILZ', email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    let detail = 'Could not send email'
    try {
      const data = JSON.parse(body) as { message?: string; code?: string }
      if (data.message) detail = data.message
    } catch {
      // ignore parse errors
    }
    console.error('[skilz] brevo send failed:', res.status, body)
    throw new Error(detail)
  }
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  await sendEmail({
    to,
    subject: `${code} is your SKILZ sign-in code`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="margin-bottom: 8px;">Your SKILZ sign-in code</h2>
        <p style="color: #555;">Enter this code to continue using SKILZ:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 24px 0;">${code}</p>
        <p style="color: #888; font-size: 14px;">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
      </div>
    `,
  })
}
