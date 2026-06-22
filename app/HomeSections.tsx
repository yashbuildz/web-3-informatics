'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@sanity/client'
import './home-sections.css'

// ── Sanity client ─────────────────────────────────────────────────────────────
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})

// ── Types ─────────────────────────────────────────────────────────────────────
interface Testimonial {
  _id: string
  name: string
  role: string
  college: string
  quote: string
  rating: number
  avatarUrl?: string
  internshipTitle?: string
  highlight?: string
}

interface Partner {
  _id: string
  name: string
  logoUrl?: string
  website?: string
}

interface FAQ {
  _id: string
  question: string
  answer: string
  order?: number
}

interface CertificateData {
  title: string
  subtitle: string
  description: string
  features: string[]
  previewImageUrl?: string
  badgeText?: string
}

interface CTAData {
  heading: string
  subheading: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
  stat1Value?: string
  stat1Label?: string
  stat2Value?: string
  stat2Label?: string
  stat3Value?: string
  stat3Label?: string
}

// ── GROQ queries ──────────────────────────────────────────────────────────────
const TESTIMONIALS_QUERY = `*[_type == "testimonial"] | order(_createdAt desc)[0...12] {
  _id, name, role, college, quote, rating, highlight,
  "avatarUrl": avatar.asset->url,
  "internshipTitle": internship->title
}`

const PARTNERS_QUERY = `*[_type == "partner"] | order(order asc) {
  _id, name, website,
  "logoUrl": logo.asset->url
}`

const FAQS_QUERY = `*[_type == "faq"] | order(order asc) {
  _id, question, answer, order
}`

const CERTIFICATE_QUERY = `*[_type == "certificateSection"][0] {
  title, subtitle, description, features, badgeText,
  "previewImageUrl": previewImage.asset->url
}`

const CTA_QUERY = `*[_type == "ctaSection"][0] {
  heading, subheading, primaryLabel, primaryHref,
  secondaryLabel, secondaryHref,
  stat1Value, stat1Label,
  stat2Value, stat2Label,
  stat3Value, stat3Label
}`

// ── Star rating ───────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="hs-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? 'hs-star filled' : 'hs-star'}>★</span>
      ))}
    </div>
  )
}

// ── Quote icon ────────────────────────────────────────────────────────────────
function QuoteIcon() {
  return (
    <svg className="hs-quote-icon" viewBox="0 0 40 30" fill="none">
      <path d="M0 30V18.75C0 13.125 1.875 8.4375 5.625 4.6875C9.375 0.9375 14.375 0 20 0v5C16.875 5 14.375 6.25 12.5 8.75C10.625 11.25 9.6875 14.0625 9.6875 17.1875H17.5V30H0ZM22.5 30V18.75C22.5 13.125 24.375 8.4375 28.125 4.6875C31.875 0.9375 36.875 0 42.5 0v5C39.375 5 36.875 6.25 35 8.75C33.125 11.25 32.1875 14.0625 32.1875 17.1875H40V30H22.5Z" fill="currentColor"/>
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS SECTION — Dark Spotlight Slider
// ══════════════════════════════════════════════════════════════════════════════
export function TestimonialsSection() {
  const [items, setItems]   = useState<Testimonial[]>([])
  const [loaded, setLoaded] = useState(false)
  const [index, setIndex]   = useState(0)
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null)

  useEffect(() => {
    client.fetch<Testimonial[]>(TESTIMONIALS_QUERY).then(data => {
      if (data?.length) { setItems(data); setLoaded(true) }
    })
  }, [])

  const fallback: Testimonial[] = [
    { _id:'1', name:'Arjun Mehta',   role:'Full Stack Intern',  college:'NIT Trichy',   quote:'Coming in with zero industry experience, I was nervous. Three months later I had a portfolio project that got me my first job offer.',                          rating:5, highlight:'Got a job offer in 3 months',        internshipTitle:'Full Stack Development'     },
    { _id:'2', name:'Arjun Mehta',   role:'Full Stack Intern',  college:'NIT Trichy',   quote:'Coming in with zero industry experience, I was nervous. Three months later I had a portfolio project that got me my first job offer.',                          rating:5, highlight:'Got a job offer in 3 months',        internshipTitle:'Full Stack Development'     },
    { _id:'3', name:'Sneha Patel',   role:'Data Science Intern',college:'BITS Pilani',  quote:'The structured curriculum and weekly reviews kept me on track. My mentor pushed me to think like a professional, not just a student.',                          rating:5, highlight:'Structured, professional growth',    internshipTitle:'Data Science Track'         },
    { _id:'4', name:'Karan Singh',   role:'UI/UX Design Intern',college:'SRM Chennai',  quote:'I went from knowing nothing about Figma to landing a design role at a startup. The project briefs were real client work — that made all the difference.',      rating:5, highlight:'Landed a design role at a startup', internshipTitle:'UI/UX Design'               },
    { _id:'5', name:'Divya Nair',    role:'Marketing Intern',   college:'NMIMS Mumbai', quote:'The SEO and ads modules were incredibly practical. I ran live campaigns with real budgets. No other internship gives you that kind of exposure.',               rating:5, highlight:'Ran live ad campaigns',            internshipTitle:'Digital Marketing'          },
    { _id:'6', name:'Rahul Mehta',   role:'Blockchain Intern',  college:'VIT Vellore',  quote:'Hands-down the best learning experience of my college life. The smart contract project in week 4 alone was worth the entire program.',                         rating:5, highlight:'Built production smart contracts',  internshipTitle:'Blockchain & Web3'          },
  ]

  const data  = loaded ? items : fallback
  const total = data.length

  const go = (dir: 'prev' | 'next') => {
    if (dir === 'prev' && index === 0) return
    if (dir === 'next' && index === total - 1) return
    setAnimDir(dir === 'next' ? 'left' : 'right')
    setTimeout(() => {
      setIndex(i => dir === 'next' ? i + 1 : i - 1)
      setAnimDir(null)
    }, 300)
  }

  const t = data[index]
  if (!t) return null

  const avatarColors = ['#6366f1','#7c3aed','#059669','#db2777','#d97706','#0284c7']
  const color = avatarColors[index % avatarColors.length]

  return (
    <section className="hs-testimonials">
      <div className="hs-testimonials-bg" />
      <div className="hs-container">

        <div className="hs-section-header">
          <span className="hs-eyebrow">Student stories</span>
          <h2 className="hs-section-title">Real results, real people</h2>
          <p className="hs-section-sub">Hear from students who transformed their careers</p>
        </div>

        {/* Dark spotlight card */}
        <div className="hs-spotlight-wrap">

          {/* Prev button */}
          <button
            className={`hs-spot-arrow hs-spot-arrow-prev ${index === 0 ? 'hs-spot-arrow-disabled' : ''}`}
            onClick={() => go('prev')}
            aria-label="Previous"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Main spotlight card */}
          <div className={`hs-spotlight-card ${animDir ? `hs-spot-slide-${animDir}` : ''}`}>

            {/* Decorative orbs */}
            <div className="hs-spot-orb1" style={{ background: color }} />
            <div className="hs-spot-orb2" />

            {/* Highlight pill */}
            {t.highlight && (
              <div className="hs-spot-highlight" style={{ borderColor: `${color}55`, color: `${color}cc`, background: `${color}18` }}>
                ✦ {t.highlight}
              </div>
            )}

            {/* Big quote mark */}
            <div className="hs-spot-bigquote">"</div>

            {/* Quote text */}
            <p className="hs-spot-quote">"{t.quote}"</p>

            {/* Author row */}
            <div className="hs-spot-author">
              <div className="hs-spot-avatar" style={{ background: color }}>
                {t.avatarUrl
                  ? <img src={t.avatarUrl} alt={t.name} style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} />
                  : <span>{t.name.charAt(0)}</span>
                }
              </div>
              <div className="hs-spot-author-info">
                <div className="hs-spot-name">{t.name}</div>
                <div className="hs-spot-role">
                  {t.role}{t.college ? ` · ${t.college}` : ''}
                </div>
              </div>
              <div className="hs-spot-stars">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="hs-spot-star">★</span>
                ))}
              </div>
            </div>

            {/* Internship track badge */}
            {t.internshipTitle && (
              <div className="hs-spot-track">{t.internshipTitle}</div>
            )}
          </div>

          {/* Next button */}
          <button
            className={`hs-spot-arrow hs-spot-arrow-next ${index === total - 1 ? 'hs-spot-arrow-disabled' : ''}`}
            onClick={() => go('next')}
            aria-label="Next"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="hs-spot-dots">
          {data.map((_, i) => (
            <button
              key={i}
              className={`hs-spot-dot ${i === index ? 'hs-spot-dot-active' : ''}`}
              onClick={() => {
                setAnimDir(i > index ? 'left' : 'right')
                setTimeout(() => { setIndex(i); setAnimDir(null) }, 300)
              }}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="hs-spot-counter">{index + 1} / {total}</div>

      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// CERTIFICATE PREVIEW SECTION — Dark Premium Digital Card
// ══════════════════════════════════════════════════════════════════════════════
export function CertificateSection() {
  const [data, setData] = useState<CertificateData | null>(null)

  const fallback: CertificateData = {
    title: 'Industry-Recognised Certificate',
    subtitle: 'Your proof of excellence',
    description: 'Every internship comes with a verifiable digital certificate that employers actually recognise. Share it on LinkedIn, attach it to your resume, and let your work speak for itself.',
    features: [
      'Verifiable via unique ID & QR code',
      'LinkedIn-ready digital format',
      'Issued within 48 hrs of completion',
      'Recognised by 200+ hiring partners',
    ],
    badgeText: 'Verified',
  }

  useEffect(() => {
    client.fetch<CertificateData>(CERTIFICATE_QUERY).then(d => {
      if (d) setData(d)
    })
  }, [])

  const d = data || fallback

  return (
    <section className="hs-certificate" id="certificate">
      <div className="hs-container hs-certificate-grid">

        {/* Left — content */}
        <div className="hs-cert-content">
          <span className="hs-eyebrow">Credentials</span>
          <h2 className="hs-section-title" style={{ textAlign: 'left' }}>{d.title}</h2>
          <p className="hs-cert-desc">{d.description}</p>
          <ul className="hs-cert-features">
            {d.features.map((f, i) => (
              <li key={i} className="hs-cert-feature">
                <span className="hs-cert-check">
                  <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#6366f1"/><polyline points="5,10 9,14 15,7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
          <a href="/internships" className="hs-cert-cta">Earn your certificate →</a>
        </div>

        {/* Right — Dark Premium Digital Card */}
        <div className="hs-cert-preview-wrap">
          <div className="hs-cert-glow" />

          {d.previewImageUrl ? (
            <img src={d.previewImageUrl} alt="Certificate preview" className="hs-cert-img" />
          ) : (
            <div className="hs-dark-cert">

              {/* Background orbs */}
              <div className="hs-dc-orb1" />
              <div className="hs-dc-orb2" />

              {/* Top row — logo + verified badge */}
              <div className="hs-dc-top">
                <div className="hs-dc-logo">
                  <div className="hs-dc-logo-icon">
                    <svg viewBox="0 0 24 24" fill="#fff" width="14" height="14"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  </div>
                  <span className="hs-dc-logo-text">W3IS</span>
                </div>
                <div className="hs-dc-verified">
                  <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><circle cx="12" cy="8" r="7" stroke="#10b981" strokeWidth="2"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/></svg>
                  {d.badgeText || 'Verified'}
                </div>
              </div>

              {/* Body */}
              <div className="hs-dc-body">
                <div className="hs-dc-label">Certificate of completion</div>
                <div className="hs-dc-name">Yashwant Naidu</div>
                <div className="hs-dc-org">Web3 Infomatics Solutions · 2026</div>
                <div className="hs-dc-track">Full Stack Development Internship</div>

                {/* Stats row */}
                <div className="hs-dc-stats">
                  <div className="hs-dc-stat">
                    <div className="hs-dc-stat-val">8 wks</div>
                    <div className="hs-dc-stat-label">Duration</div>
                  </div>
                  <div className="hs-dc-stat-divider" />
                  <div className="hs-dc-stat">
                    <div className="hs-dc-stat-val">A+</div>
                    <div className="hs-dc-stat-label">Grade</div>
                  </div>
                  <div className="hs-dc-stat-divider" />
                  <div className="hs-dc-stat">
                    <div className="hs-dc-stat-val">200+</div>
                    <div className="hs-dc-stat-label">Hiring partners</div>
                  </div>
                  <div className="hs-dc-stat-divider" />
                  <div className="hs-dc-stat">
                    <div className="hs-dc-stat-val">48h</div>
                    <div className="hs-dc-stat-label">Issued in</div>
                  </div>
                </div>
              </div>

              {/* Footer — ID + QR + verify */}
              <div className="hs-dc-footer">
                <div className="hs-dc-id-block">
                  <div className="hs-dc-id-label">Certificate ID</div>
                  <div className="hs-dc-id">W3IS-2026-FSW-4821</div>
                </div>
                <div className="hs-dc-qr-block">
                  <div className="hs-dc-qr">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className="hs-dc-qr-cell"
                        style={{
                          background: [0,4,20,24,1,2,3,5,9,15,19,21,22,23].includes(i)
                            ? '#6366f1'
                            : i % 3 === 0 ? '#4f46e5' : '#1e1b4b'
                        }}
                      />
                    ))}
                  </div>
                  <div className="hs-dc-qr-label">Scan to verify</div>
                </div>
              </div>

              {/* Bottom accent stripe */}
              <div className="hs-dc-stripe" />
            </div>
          )}

          {/* Floating badge */}
          <div className="hs-cert-float-badge">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><circle cx="12" cy="8" r="7" stroke="#fff" strokeWidth="2"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            Recognised by 200+ companies
          </div>
        </div>

      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// CERTIFICATE PREVIEW SECTION
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// PARTNER COMPANIES — single row marquee
// ══════════════════════════════════════════════════════════════════════════════
export function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([])

  const fallback: Partner[] = [
    { _id:'1',  name:'Google'    },
    { _id:'2',  name:'Microsoft' },
    { _id:'3',  name:'Amazon'    },
    { _id:'4',  name:'Flipkart'  },
    { _id:'5',  name:'Razorpay'  },
    { _id:'6',  name:'Zepto'     },
    { _id:'7',  name:'CRED'      },
    { _id:'8',  name:'PhonePe'   },
    { _id:'9',  name:'Swiggy'    },
    { _id:'10', name:'Meesho'    },
    { _id:'11', name:'Groww'     },
    { _id:'12', name:'Zomato'    },
  ]

  useEffect(() => {
    client.fetch<Partner[]>(PARTNERS_QUERY).then(d => {
      if (d?.length) setPartners(d)
    })
  }, [])

  const data = partners.length ? partners : fallback
  const tripled = [...data, ...data, ...data] // triple for seamless single-row loop

  return (
    <section className="hs-partners">
      <div className="hs-container">
        <div className="hs-partners-header">
          <span className="hs-partners-label">Trusted by students placed at</span>
        </div>
      </div>

      <div className="hs-marquee-wrap">
        <div className="hs-marquee-fade-left" />
        <div className="hs-marquee-fade-right" />
        <div className="hs-marquee-track">
          {tripled.map((p, i) => (
            <div key={`${p._id}-${i}`} className="hs-partner-chip">
              {p.logoUrl ? (
                <img src={p.logoUrl} alt={p.name} className="hs-partner-logo" />
              ) : (
                <span className="hs-partner-name">{p.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// FAQ SECTION
// ══════════════════════════════════════════════════════════════════════════════
export function FAQSection() {
  const [items, setItems] = useState<FAQ[]>([])
  const [open, setOpen] = useState<string | null>(null)

  const fallback: FAQ[] = [
    { _id:'1', question:'Do I need prior experience to apply?', answer:'Not at all. Many of our programs are designed for beginners. Each listing clearly mentions the required skill level — look for "No experience yet" in the skills section.' },
    { _id:'2', question:'Are the internships remote or on-site?', answer:'Most of our internships are fully remote, giving you the flexibility to work from anywhere in India. Some roles offer hybrid or on-site options which are clearly tagged on the listing.' },
    { _id:'3', question:'Will I receive a certificate?', answer:'Yes — every internship includes a verifiable digital certificate on successful completion. It\'s issued within 48 hours and can be shared directly on LinkedIn or attached to your resume.' },
    { _id:'4', question:'How long do the internships run?', answer:'Programs range from 4 weeks to 6 months depending on the track. You can filter by duration on the internships page to find one that fits your schedule.' },
    { _id:'5', question:'Is there a fee to apply?', answer:'Applying is always free. Some premium tracks (Pro / Elite tier) have a program fee to cover mentorship, resources, and certification. Free tier internships are completely no-cost.' },
    { _id:'6', question:'How soon will I hear back after applying?', answer:'Our team reviews every application within 2–3 business days. You\'ll receive a confirmation email immediately, and a decision email shortly after review.' },
  ]

  useEffect(() => {
    client.fetch<FAQ[]>(FAQS_QUERY).then(d => {
      if (d?.length) setItems(d)
    })
  }, [])

  const data = items.length ? items : fallback

  return (
    <section className="hs-faq">
      <div className="hs-container">
        <div className="hs-section-header">
          <span className="hs-eyebrow">FAQ</span>
          <h2 className="hs-section-title">Questions? We've got answers.</h2>
          <p className="hs-section-sub">Everything you need to know before you apply</p>
        </div>

        <div className="hs-faq-grid">
          {data.map((faq) => (
            <div
              key={faq._id}
              className={`hs-faq-item ${open === faq._id ? 'open' : ''}`}
            >
              <button
                className="hs-faq-q"
                onClick={() => setOpen(open === faq._id ? null : faq._id)}
              >
                <span>{faq.question}</span>
                <span className="hs-faq-icon">{open === faq._id ? '−' : '+'}</span>
              </button>
              <div className="hs-faq-body">
                <div className="hs-faq-a">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="hs-faq-footer">
          Still have questions?{' '}
          <a href="mailto:web3informaticsolutions@gmail.com" className="hs-faq-link">
            Email us →
          </a>
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// CTA BANNER
// ══════════════════════════════════════════════════════════════════════════════
export function CTASection() {
  const [data, setData] = useState<CTAData | null>(null)

  const fallback: CTAData = {
    heading: 'Your career starts with one application.',
    subheading: 'Join 2,000+ students who took the leap. Most of them didn\'t feel ready either.',
    primaryLabel: 'Browse internships',
    primaryHref: '/internships',
    secondaryLabel: 'See certificates',
    secondaryHref: '#certificate',
    stat1Value: '2,400+',
    stat1Label: 'Students placed',
    stat2Value: '98%',
    stat2Label: 'Completion rate',
    stat3Value: '4.9★',
    stat3Label: 'Average rating',
  }

  useEffect(() => {
    client.fetch<CTAData>(CTA_QUERY).then(d => {
      if (d) setData(d)
    })
  }, [])

  const d = data || fallback

  return (
    <section className="hs-cta">
      <div className="hs-cta-bg">
        <div className="hs-cta-blob1" />
        <div className="hs-cta-blob2" />
        <div className="hs-cta-grid-lines" />
      </div>

      <div className="hs-container">
        {/* Stats row */}
        <div className="hs-cta-stats">
          {[
            [d.stat1Value, d.stat1Label],
            [d.stat2Value, d.stat2Label],
            [d.stat3Value, d.stat3Label],
          ].filter(([v]) => v).map(([val, label], i) => (
            <div key={i} className="hs-cta-stat">
              <div className="hs-cta-stat-val">{val}</div>
              <div className="hs-cta-stat-label">{label}</div>
            </div>
          ))}
        </div>

        <h2 className="hs-cta-heading">{d.heading}</h2>
        <p className="hs-cta-sub">{d.subheading}</p>

        <div className="hs-cta-actions">
          <a href={d.primaryHref} className="hs-cta-primary">
            {d.primaryLabel}
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          {d.secondaryLabel && (
            <a href={d.secondaryHref || '#'} className="hs-cta-secondary">
              {d.secondaryLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}