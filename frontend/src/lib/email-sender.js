import nodemailer from 'nodemailer'

let cachedTransporter = null

function getTransporter() {
  if (!cachedTransporter) {
    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT || 587)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (!host || !user || !pass) {
      return null
    }

    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })
  }

  return cachedTransporter
}

export async function sendCustomerEmail({ to, subject, body }) {
  const transporter = getTransporter()
  if (!transporter) {
    console.info('[email-sender] SMTP credentials missing, skipping send. Email preview:', {
      to,
      subject,
      body,
    })
    return { status: 'mocked' }
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com'
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text: body,
  })

  return { status: 'sent', messageId: info.messageId }
}