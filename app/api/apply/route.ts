// app/api/apply/route.ts
import nodemailer from 'nodemailer'
import { NextRequest, NextResponse } from 'next/server'

interface ApplyBody {
  internshipId:       string
  internshipTitle:    string
  internshipDomain:   string
  internshipDuration: string
  internshipTier:     string
  internshipPrice:    number
  name:        string
  email:       string
  phone?:      string
  college?:    string
  year?:       string
  skills?:     string[]
  why:         string
  portfolio?:  string
}

// ── Sanity ────────────────────────────────────────────────────────────────────

async function saveToSanity(body: ApplyBody): Promise<string> {
  // ✅ Matches your actual .env.local names
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
  const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET!
  const token     = process.env.SANITY_WRITE_TOKEN!

  if (!projectId || !dataset || !token) {
    throw new Error(`Missing Sanity env vars. Got: projectId=${projectId}, dataset=${dataset}, token=${token?.slice(0,8)}`)
  }

  const doc = {
    _type:      'application',
    internship: { _type: 'reference', _ref: body.internshipId },
    status:     'pending',
    name:       body.name,
    email:      body.email,
    phone:      body.phone     || '',
    college:    body.college   || '',
    year:       body.year      || '',
    skills:     body.skills    || [],
    why:        body.why,
    portfolio:  body.portfolio || '',
    appliedAt:  new Date().toISOString(),
  }

  const url = `https://${projectId}.api.sanity.io/v2021-06-07/data/mutate/${dataset}`

  console.log('[apply] Saving to Sanity:', url)

  const res = await fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ mutations: [{ create: doc }] }),
  })

  const data = await res.json()
  console.log('[apply] Sanity response:', JSON.stringify(data))

  if (!res.ok) {
    throw new Error(`Sanity error ${res.status}: ${JSON.stringify(data)}`)
  }

  return data?.results?.[0]?.id ?? 'unknown'
}

// ── Resend ────────────────────────────────────────────────────────────────────

async function sendConfirmationEmail(body: ApplyBody): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
  })

  const priceLabel = body.internshipPrice === 0
    ? 'Free'
    : `₹${body.internshipPrice.toLocaleString('en-IN')}`

  const skillsLine = body.skills?.length ? body.skills.join(', ') : 'Not specified'

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Application Received</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">

        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:26px;font-weight:700;color:#fff;">${siteName}</p>
            <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,.8);">Application Confirmation</p>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 16px;font-size:16px;color:#111827;">Hi <strong>${body.name}</strong>,</p>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
              We've received your application for <strong>${body.internshipTitle}</strong>.
              Our team will review it and get back to you shortly.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;
                           letter-spacing:.8px;color:#6366f1;">Applied for</p>
                <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#111827;">${body.internshipTitle}</p>
                <table cellpadding="0" cellspacing="0"><tr>
                  <td style="padding-right:20px;">
                    <p style="margin:0;font-size:12px;color:#6b7280;">Domain</p>
                    <p style="margin:2px 0 0;font-size:13px;color:#111827;">${body.internshipDomain}</p>
                  </td>
                  <td style="padding-right:20px;">
                    <p style="margin:0;font-size:12px;color:#6b7280;">Duration</p>
                    <p style="margin:2px 0 0;font-size:13px;color:#111827;">${body.internshipDuration}</p>
                  </td>
                  <td>
                    <p style="margin:0;font-size:12px;color:#6b7280;">Fee</p>
                    <p style="margin:2px 0 0;font-size:13px;color:#111827;">${priceLabel}</p>
                  </td>
                </tr></table>
              </td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0"
              style="border-collapse:collapse;font-size:13px;color:#374151;margin-bottom:24px;">
              ${[
                ['Email',     body.email],
                ['Phone',     body.phone    || '—'],
                ['College',   body.college  || '—'],
                ['Year',      body.year     || '—'],
                ['Skills',    skillsLine],
                ['Portfolio', body.portfolio || '—'],
              ].map(([label, val], i) => `
              <tr style="background:${i % 2 === 0 ? '#f9fafb' : '#fff'};">
                <td style="padding:9px 14px;font-weight:600;border-bottom:1px solid #e5e7eb;width:110px;">${label}</td>
                <td style="padding:9px 14px;border-bottom:1px solid #e5e7eb;">${val}</td>
              </tr>`).join('')}
            </table>

            <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
              Questions? Reply to this email — we're happy to help.<br/>
              — The ${siteName} Team
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated confirmation from ${siteName}.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  // Send confirmation to applicant
  console.log('[apply] Sending email to:', body.email, 'from:', fromEmail)

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from:    `${siteName} <${fromEmail}>`,
      to:      [body.email],
      subject: `✅ Application received – ${body.internshipTitle} | ${siteName}`,
      html,
    }),
  })

  const resData = await res.json()
  console.log('[apply] Resend applicant response:', JSON.stringify(resData))

  if (!res.ok) {
    throw new Error(`Resend error ${res.status}: ${JSON.stringify(resData)}`)
  }

  // Also notify admin
  if (adminEmail) {
    const adminRes = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from:    `${siteName} <${fromEmail}>`,
        to:      [adminEmail],
        subject: `📋 New application: ${body.name} → ${body.internshipTitle}`,
        html: `
          <p>New application received on ${new Date().toLocaleString('en-IN')}.</p>
          <ul>
            <li><strong>Name:</strong> ${body.name}</li>
            <li><strong>Email:</strong> ${body.email}</li>
            <li><strong>Phone:</strong> ${body.phone || '—'}</li>
            <li><strong>Internship:</strong> ${body.internshipTitle}</li>
            <li><strong>College:</strong> ${body.college || '—'}</li>
            <li><strong>Year:</strong> ${body.year || '—'}</li>
            <li><strong>Skills:</strong> ${skillsLine}</li>
          </ul>
          <p><strong>Motivation:</strong><br/>${body.why}</p>
          ${body.portfolio ? `<p><strong>Portfolio:</strong> <a href="${body.portfolio}">${body.portfolio}</a></p>` : ''}
        `,
      }),
    })
    const adminData = await adminRes.json()
    console.log('[apply] Resend admin response:', JSON.stringify(adminData))
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Log env vars on every request so you can verify in terminal
  console.log('[apply] ENV CHECK:', {
    projectId:  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET,
    token:      process.env.SANITY_WRITE_TOKEN?.slice(0, 10),
    resendKey:  process.env.RESEND_API_KEY?.slice(0, 10),
    resendFrom: process.env.RESEND_FROM,
    adminEmail: process.env.ADMIN_EMAIL,
  })

  let body: ApplyBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 })
  }

  // Validate
  if (!body.name?.trim())
    return NextResponse.json({ message: 'Name is required.' }, { status: 422 })
  if (!body.email?.trim() || !/\S+@\S+\.\S+/.test(body.email))
    return NextResponse.json({ message: 'A valid email is required.' }, { status: 422 })
  if (!body.why?.trim() || body.why.trim().length < 40)
    return NextResponse.json({ message: 'Motivation must be at least 40 characters.' }, { status: 422 })
  if (!body.internshipId)
    return NextResponse.json({ message: 'internshipId is required.' }, { status: 422 })

  // Save to Sanity
  let applicationId: string
  try {
    applicationId = await saveToSanity(body)
    console.log('[apply] Saved to Sanity, id:', applicationId)
  } catch (err: any) {
    console.error('[apply] Sanity save failed:', err.message)
    return NextResponse.json(
      { message: `Sanity error: ${err.message}` },
      { status: 500 },
    )
  }

  // Send email
try {
  const nodemailer = require('nodemailer')

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
  })

  const priceLabel = body.internshipPrice === 0
    ? 'Free'
    : `₹${body.internshipPrice.toLocaleString('en-IN')}`

  const skillsLine = body.skills?.length ? body.skills.join(', ') : 'Not specified'

  // Email to applicant
  await transporter.sendMail({
    from: `${process.env.NEXT_PUBLIC_SITE_NAME || 'InternHub'} <${process.env.GMAIL_USER}>`,
    to:   body.email,
    subject: `✅ Application received – ${body.internshipTitle}`,
    html: `<p>Hi ${body.name},</p>
           <p>We've received your application for <strong>${body.internshipTitle}</strong> (${body.internshipDomain} · ${body.internshipDuration} · ${priceLabel}).</p>
           <p><strong>Your details:</strong><br/>
           Email: ${body.email}<br/>
           Phone: ${body.phone || '—'}<br/>
           College: ${body.college || '—'}<br/>
           Year: ${body.year || '—'}<br/>
           Skills: ${skillsLine}</p>
           <p>Our team will review your application and get back to you within 2–3 business days.</p>
           <p>— The InternHub Team</p>`,
  })

  // Notification to admin
  await transporter.sendMail({
    from:    `InternHub <${process.env.GMAIL_USER}>`,
    to:      process.env.ADMIN_EMAIL!,
    subject: `📋 New application: ${body.name} → ${body.internshipTitle}`,
    html: `<p>New application received.</p>
           <ul>
             <li><strong>Name:</strong> ${body.name}</li>
             <li><strong>Email:</strong> ${body.email}</li>
             <li><strong>Phone:</strong> ${body.phone || '—'}</li>
             <li><strong>Internship:</strong> ${body.internshipTitle}</li>
             <li><strong>College:</strong> ${body.college || '—'}</li>
             <li><strong>Skills:</strong> ${skillsLine}</li>
           </ul>
           <p><strong>Motivation:</strong><br/>${body.why}</p>
           ${body.portfolio ? `<p><strong>Portfolio:</strong> <a href="${body.portfolio}">${body.portfolio}</a></p>` : ''}`,
  })

  console.log('[apply] Emails sent successfully via Gmail')
} catch (err: any) {
  console.error('[apply] Email failed (non-fatal):', err.message)
}
  return NextResponse.json({ success: true, applicationId }, { status: 201 })
}