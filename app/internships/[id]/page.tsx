'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import './detail.css'

// ── Sanity client ────────────────────────────────────────────────────────────

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})
const builder = createImageUrlBuilder(client)
function urlFor(source: any) { return builder.image(source).url() }

// ── GROQ query ───────────────────────────────────────────────────────────────

const QUERY = `*[_type == "internship" && (slug.current == $id || _id == $id)][0] {
  _id, title, domain, duration, tier, price, rating, reviews,
  skills, icon, bgClass, mode, seats, startDate, hot, isNew,
  certificate, description, highlights, curriculum,
  faqs[]{ question, answer },
  mentors[]{ name, role, "avatarUrl": avatar.asset->url },
  "slug": slug.current,
  "imageUrl": image.asset->url,
  image
}`

// ── Types ────────────────────────────────────────────────────────────────────

interface Mentor { name: string; role: string; avatarUrl?: string }
interface FAQ    { question: string; answer: string }

interface Internship {
  _id:          string
  title:        string
  domain:       string
  duration:     string
  tier:         'Free' | 'Pro' | 'Elite'
  price:        number
  rating:       number
  reviews:      number
  skills?:      string[]
  icon?:        string
  bgClass?:     string
  mode:         'Remote' | 'Hybrid' | 'On-site'
  seats:        number
  startDate:    string
  hot?:         boolean
  isNew?:       boolean
  certificate?: boolean
  description?: string
  highlights?:  string[]
  curriculum?:  string[]
  faqs?:        FAQ[]
  mentors?:     Mentor[]
  slug?:        string
  imageUrl?:    string
  image?:       any
}

// ── Gradients ────────────────────────────────────────────────────────────────

const bgGradients: Record<string, string> = {
  'bg-violet':  'linear-gradient(135deg,#7c3aed,#4f46e5)',
  'bg-blue':    'linear-gradient(135deg,#2563eb,#0ea5e9)',
  'bg-emerald': 'linear-gradient(135deg,#059669,#10b981)',
  'bg-pink':    'linear-gradient(135deg,#db2777,#ec4899)',
  'bg-amber':   'linear-gradient(135deg,#d97706,#f59e0b)',
  'bg-rose':    'linear-gradient(135deg,#e11d48,#f43f5e)',
  'bg-cyan':    'linear-gradient(135deg,#0284c7,#06b6d4)',
  'bg-orange':  'linear-gradient(135deg,#ea580c,#f97316)',
  'bg-sky':     'linear-gradient(135deg,#0369a1,#38bdf8)',
  'bg-green':   'linear-gradient(135deg,#15803d,#22c55e)',
}

const tierColor: Record<string, string> = { Free:'tier-free', Pro:'tier-pro', Elite:'tier-elite' }
const modeColor: Record<string, string> = { Remote:'mode-remote', Hybrid:'mode-hybrid', 'On-site':'mode-onsite' }

// ── Icons ────────────────────────────────────────────────────────────────────

const BoltIcon     = ({ fill = 'currentColor' }: { fill?: string }) => (
  <svg viewBox="0 0 24 24" fill={fill}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
)
const ChevronDown  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{width:13,height:13}}><path d="M6 9l6 6 6-6"/></svg>
const SunIcon      = () => <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round" style={{width:10,height:10}}><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
const MoonIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth={2.5} strokeLinecap="round" style={{width:10,height:10}}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
const CheckIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><polyline points="20 6 9 17 4 12"/></svg>
const CheckBigIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{width:32,height:32}}><polyline points="20 6 9 17 4 12"/></svg>
const ArrowLeft    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
const ClockIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{width:15,height:15}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const UsersIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{width:15,height:15}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const AwardIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{width:15,height:15}}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
const MapPinIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{width:15,height:15}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const CalIcon      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{width:15,height:15}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>

// ── Empty state helper ────────────────────────────────────────────────────────

function EmptySection({ field, label }: { field: string; label: string }) {
  if (process.env.NODE_ENV !== 'development') return null
  return (
    <div style={{
      padding: '14px 18px', background: '#fef3c7', borderRadius: 10,
      border: '1.5px dashed #f59e0b', fontSize: 13, color: '#92400e',
    }}>
      <b>Studio hint:</b> Go to Sanity Studio → open this internship → fill in{' '}
      <code style={{ background: '#fde68a', padding: '1px 6px', borderRadius: 4 }}>{field}</code>{' '}
      to show the &quot;{label}&quot; section.
    </div>
  )
}

// ── Theme toggle ──────────────────────────────────────────────────────────────

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button className="theme-toggle" onClick={onToggle} aria-label="Toggle dark mode">
      <div className="theme-toggle-thumb">{isDark ? <MoonIcon /> : <SunIcon />}</div>
    </button>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <nav>
      <Link href="/" className="nav-logo">
        <div className="nav-logo-icon"><BoltIcon fill="inherit" /></div>
        W3IS
      </Link>
      <div className="nav-center">
        <Link href="/internships" className="nav-dd">Internships <ChevronDown /></Link>
        <div className="nav-dd">Certificates <ChevronDown /></div>
        <div className="nav-dd">Projects <ChevronDown /></div>
      </div>
      <div className="nav-right">
        <div className="nav-link">List your company</div>
        <div className="nav-link">Sign in</div>
        <ThemeToggle isDark={isDark} onToggle={onToggle} />
        <div className="nav-cta">Get started</div>
        <div className="nav-avatar">YS</div>
      </div>
    </nav>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  const cols = [
    { title: 'Solutions', links: ['Internships','Certificates','Projects','Reports','Mentorship'] },
    { title: 'Support',   links: ['Getting started','Help center','Documentation','Guides','Status'] },
    { title: 'Company',   links: ['About','Blog','Jobs','Press','Partners'] },
    { title: 'Legal',     links: ['Terms of service','Privacy policy','Cookie policy','Licenses','Imprint'] },
  ]
  return (
    <footer>
      <div className="footer-top">
        <div>
          <div className="footer-brand">
            <div className="footer-brand-icon"><BoltIcon fill="#07070a" /></div>
            W3IS
          </div>
          <div className="footer-desc">Making the world better through internships, one certificate at a time.</div>
          <div className="footer-socials">
            {[0,1,2,3].map(i => (
              <div key={i} className="footer-social">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg>
              </div>
            ))}
          </div>
        </div>
        {cols.map(col => (
          <div key={col.title}>
            <div className="footer-col-title">{col.title}</div>
            <div className="footer-links">
              {col.links.map(l => <div key={l} className="footer-link">{l}</div>)}
            </div>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">© 2026 Web3 Infomatics Solutions, Inc. All rights reserved.</div>
      </div>
    </footer>
  )
}

// ── Apply Modal ───────────────────────────────────────────────────────────────

type FormData = {
  name: string; email: string; phone: string;
  college: string; year: string; why: string;
  skills: string[]; portfolio: string;
}

function ApplyModal({ item, onClose }: { item: Internship; onClose: () => void }) {
  const [step, setStep]           = useState<1|2>(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [form, setForm]           = useState<FormData>({
    name:'', email:'', phone:'', college:'', year:'', why:'', skills:[], portfolio:''
  })
  const overlayRef = useRef<HTMLDivElement>(null)

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }))

  // Close on overlay click
  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const step1Valid = form.name.trim() && /\S+@\S+\.\S+/.test(form.email)
  const step2Valid = form.why.trim().length >= 30

  const handleSubmit = async () => {
    if (!step2Valid) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internshipId:       item._id,
          internshipTitle:    item.title,
          internshipDomain:   item.domain,
          internshipDuration: item.duration,
          internshipTier:     item.tier,
          internshipPrice:    item.price,
          ...form,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Submission failed. Please try again.')
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlay}>
      <div className="modal-box" role="dialog" aria-modal="true">

        {/* Header band */}
        <div className="modal-header-band">
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
          <div className="modal-header-inner">
            <div className="modal-icon">{item.icon || '🚀'}</div>
            <div>
              <div className="modal-title">{item.title}</div>
              <div className="modal-sub">
                {item.domain} · {item.duration} ·{' '}
                {item.price === 0 ? 'Free' : `₹${item.price.toLocaleString()}`}
              </div>
            </div>
          </div>
        </div>

        {submitted ? (
          /* ── Success ── */
          <div className="modal-success">
            <div className="modal-success-anim"><CheckBigIcon /></div>
            <div className="modal-success-title">Application submitted!</div>
            <div className="modal-success-tag">
              <CheckIcon /> Under review
            </div>
            <div className="modal-success-sub">
              Thanks, {form.name.split(' ')[0]}! We&apos;ve received your application for{' '}
              <strong>{item.title}</strong>. Our team will review it and get back to you
              at <strong>{form.email}</strong> within 2–3 business days.
            </div>
            <button className="modal-done-btn" onClick={onClose}>Back to internship</button>
          </div>
        ) : (
          <>
            {/* ── Stepper ── */}
            <div className="modal-stepper">
              {(['Personal info', 'Tell us more'] as const).map((label, idx) => {
                const s = idx + 1
                return (
                  <div key={s} className={`modal-step ${step === s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
                    <div className="modal-step-num">
                      {step > s ? <CheckIcon /> : s}
                    </div>
                    <div className="modal-step-label">{label}</div>
                  </div>
                )
              })}
            </div>

            {/* ── Form body ── */}
            <div className="modal-body">
              {step === 1 && (
                <div className="modal-fields">
                  <div className="modal-field">
                    <label>Full name *</label>
                    <input
                      required autoFocus
                      placeholder="Ravi Kumar"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="modal-field">
                    <label>Email address *</label>
                    <input
                      type="email" required
                      placeholder="ravi@email.com"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="modal-field-row">
                    <div className="modal-field">
                      <label>Phone number</label>
                      <input
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={e => set('phone', e.target.value)}
                        suppressHydrationWarning
                      />
                    </div>
                    <div className="modal-field">
                      <label>College / University</label>
                      <input
                        placeholder="IIT Bombay"
                        value={form.college}
                        onChange={e => set('college', e.target.value)}
                        suppressHydrationWarning
                      />
                    </div>
                  </div>
                  <div className="modal-field">
                    <label>Current year of study</label>
                    <input
                      placeholder="e.g. 3rd year B.Tech"
                      value={form.year}
                      onChange={e => set('year', e.target.value)}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="modal-actions">
                    <button
                      className="modal-btn-primary"
                      disabled={!step1Valid}
                      onClick={() => { if (step1Valid) setStep(2) }}
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="modal-fields">
                  <div className="modal-field">
                    <label>Why do you want to join? *</label>
                    <textarea
                      required rows={6}
                      placeholder="Tell us what excites you about this internship, your relevant experience, and what you hope to learn. (min. 30 characters)"
                      value={form.why}
                      onChange={e => set('why', e.target.value)}
                    />
                    <div className="modal-char-count">
                      {form.why.length} chars{form.why.length < 30 ? ` — ${30 - form.why.length} more needed` : ' ✓'}
                    </div>
                  </div>
                  {error && (
                    <div style={{
                      padding: '10px 14px', borderRadius: 8, marginBottom: 4,
                      background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)',
                      fontSize: 13, color: '#ef4444',
                    }}>
                      {error}
                    </div>
                  )}
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="modal-btn-secondary"
                      onClick={() => setStep(1)}
                    >
                      ← Back
                    </button>
                    <button
                      className="modal-btn-primary"
                      disabled={!step2Valid || loading}
                      onClick={handleSubmit}
                    >
                      {loading ? 'Submitting…' : 'Submit application →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(o => !o)}>
        {faq.question}
        <span className="faq-arrow">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="faq-a">{faq.answer}</div>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InternshipDetailPage() {
  const params = useParams()
  const id     = params?.id as string

  const [isDark,   setIsDark]   = useState(false)
  const [data,     setData]     = useState<Internship | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [applying, setApplying] = useState(false)

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    client.fetch<Internship>(QUERY, { id })
      .then(res => {
        if (res) { setData(res) } else { setNotFound(true) }
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [id])

  if (loading) return (
    <>
      <Nav isDark={isDark} onToggle={toggleTheme} />
      <div className="detail-loading">
        <div className="detail-spinner" />
        <p>Loading internship details…</p>
      </div>
    </>
  )

  if (notFound || !data) return (
    <>
      <Nav isDark={isDark} onToggle={toggleTheme} />
      <div style={{ textAlign:'center', padding:'80px 20px' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
        <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>Internship not found</div>
        <div style={{ fontSize:14, color:'#6b7280', marginBottom:24 }}>
          This internship may have been removed or the URL is incorrect.
        </div>
        <Link
          href="/internships"
          style={{ background:'#111', color:'#fff', padding:'10px 24px', borderRadius:24, fontSize:14, fontWeight:600, textDecoration:'none' }}
        >
          Browse all internships
        </Link>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Nav isDark={isDark} onToggle={toggleTheme} />

      {/* ── HERO ── */}
      <div className="detail-hero">
        {(data.imageUrl || data.image) && (
          <img src={data.imageUrl ?? urlFor(data.image)} alt={data.title} className="detail-hero-img" />
        )}
        <div className="detail-hero-grid" />
        <div className="detail-hero-overlay" />

        <div className="detail-hero-content">
          <Link href="/internships" className="detail-back">
            <ArrowLeft /> All internships
          </Link>

          <div className="detail-hero-badges">
            {data.hot   && <span className="badge-hot">🔥 Hot</span>}
            {data.isNew && <span className="badge-new">✨ New</span>}
            <span className={`tier-badge ${tierColor[data.tier]}`}>{data.tier}</span>
            <span className={`mode-badge ${modeColor[data.mode]}`}>{data.mode}</span>
          </div>

          {data.icon && <div className="detail-hero-icon">{data.icon}</div>}
          <h1 className="detail-hero-title">{data.title}</h1>
          <div className="detail-hero-domain">{data.domain}</div>

          <div className="detail-hero-meta">
            <span className="detail-hero-meta-item"><ClockIcon /> {data.duration}</span>
            <span className="detail-hero-meta-item"><MapPinIcon /> {data.mode}</span>
            <span className="detail-hero-meta-item"><UsersIcon /> {data.seats} seats left</span>
            {data.certificate && <span className="detail-hero-meta-item"><AwardIcon /> Certificate included</span>}
            {data.startDate && <span className="detail-hero-meta-item"><CalIcon /> Starts {data.startDate}</span>}
          </div>

          <div className="detail-hero-rating">
            <div className="detail-hero-rating-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ color: i < Math.floor(data.rating) ? '#f59e0b' : 'rgba(255,255,255,0.18)' }}>★</span>
              ))}
            </div>
            <span className="detail-hero-rating-val">{data.rating}</span>
            <span className="detail-hero-rating-count">({data.reviews} reviews)</span>
          </div>
        </div>
      </div>

      {/* ── STICKY BAR ── */}
      <div className="detail-sticky-bar">
        <div className="detail-sticky-inner">
          <div className="detail-sticky-info">
            <span className="detail-sticky-title">{data.title}</span>
            <span className="detail-sticky-domain">{data.domain}</span>
          </div>
          <div className="detail-sticky-right">
            <div className="detail-price-tag">
              {data.price === 0
                ? <span className="detail-price-free">Free</span>
                : <>
                    <span className="detail-price-amt">₹{data.price.toLocaleString()}</span>
                    <span className="detail-price-tier">/ {data.tier}</span>
                  </>
              }
            </div>
            <button className="detail-apply-btn" onClick={() => setApplying(true)}>
              Apply now →
            </button>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="detail-body">
        <div className="detail-main">

          {/* About */}
          <section className="detail-section">
            <div className="detail-label-eyebrow">About</div>
            <h2 className="detail-section-title">About this internship</h2>
            {data.description
              ? <p className="detail-desc">{data.description}</p>
              : <EmptySection field="description" label="About this internship" />
            }
          </section>

          {/* Highlights */}
          <section className="detail-section">
            <div className="detail-label-eyebrow">Benefits</div>
            <h2 className="detail-section-title">What you&apos;ll gain</h2>
            {data.highlights && data.highlights.length > 0
              ? <div className="detail-highlights">
                  {data.highlights.map((h, i) => (
                    <div key={i} className="detail-highlight-item">
                      <span className="detail-highlight-check"><CheckIcon /></span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              : <EmptySection field="highlights" label="What you'll gain" />
            }
          </section>

          {/* Curriculum */}
          <section className="detail-section">
            <div className="detail-label-eyebrow">Curriculum</div>
            <h2 className="detail-section-title">Program structure</h2>
            {data.curriculum && data.curriculum.length > 0
              ? <div className="detail-curriculum">
                  {data.curriculum.map((week, i) => (
                    <div key={i} className="detail-week">
                      <div className="detail-week-dot">{i + 1}</div>
                      <div className="detail-week-text">{week}</div>
                    </div>
                  ))}
                </div>
              : <EmptySection field="curriculum" label="Curriculum" />
            }
          </section>

          {/* Skills */}
          <section className="detail-section">
            <div className="detail-label-eyebrow">Skills</div>
            <h2 className="detail-section-title">Skills you&apos;ll learn</h2>
            {data.skills && data.skills.length > 0
              ? <div className="detail-skills">
                  {data.skills.map(s => <span key={s} className="detail-skill-pill">{s}</span>)}
                </div>
              : <EmptySection field="skills" label="Skills" />
            }
          </section>

          {/* Mentors */}
          {data.mentors && data.mentors.length > 0 && (
            <section className="detail-section">
              <div className="detail-label-eyebrow">Team</div>
              <h2 className="detail-section-title">Your mentors</h2>
              <div className="detail-mentors">
                {data.mentors.map((m, i) => (
                  <div key={i} className="detail-mentor-card">
                    {m.avatarUrl
                      ? <img src={m.avatarUrl} alt={m.name} className="detail-mentor-avatar" />
                      : <div className="detail-mentor-avatar-fallback">{m.name?.charAt(0).toUpperCase()}</div>
                    }
                    <div className="detail-mentor-name">{m.name}</div>
                    <div className="detail-mentor-role">{m.role}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          <section className="detail-section">
            <div className="detail-label-eyebrow">FAQ</div>
            <h2 className="detail-section-title">Frequently asked questions</h2>
            {data.faqs && data.faqs.length > 0
              ? <div className="detail-faqs">
                  {data.faqs.map((faq, i) => <FAQItem key={i} faq={faq} />)}
                </div>
              : <EmptySection field="faqs" label="FAQs" />
            }
          </section>

        </div>

        {/* ── SIDEBAR ── */}
        <aside className="detail-sidebar">
          <div className="detail-sidebar-card">
            <div className="dsc-price">
              {data.price === 0
                ? <span className="dsc-price-free">Free</span>
                : <><span className="dsc-price-amt">₹{data.price.toLocaleString()}</span><span className="dsc-price-tier"> / {data.tier}</span></>
              }
            </div>
            <div className="dsc-price-sub">
              {data.price === 0 ? 'No cost to apply' : 'One-time payment'}
            </div>

            <button className="dsc-apply-btn" onClick={() => setApplying(true)}>
              Apply now →
            </button>
            <button className="dsc-share" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
              Copy link to share ↗
            </button>

            <div className="dsc-divider" />

            <div className="dsc-details">
              <div className="dsc-row">
                <div className="dsc-row-left"><ClockIcon /><span>Duration</span></div>
                <span className="dsc-row-val">{data.duration}</span>
              </div>
              <div className="dsc-row">
                <div className="dsc-row-left"><MapPinIcon /><span>Mode</span></div>
                <span className="dsc-row-val">{data.mode}</span>
              </div>
              <div className="dsc-row">
                <div className="dsc-row-left"><UsersIcon /><span>Seats left</span></div>
                <span className="dsc-row-val seats-info">{data.seats}</span>
              </div>
              <div className="dsc-row">
                <div className="dsc-row-left"><CalIcon /><span>Starts</span></div>
                <span className="dsc-row-val">{data.startDate}</span>
              </div>
              {data.certificate && (
                <div className="dsc-row">
                  <div className="dsc-row-left"><AwardIcon /><span>Certificate</span></div>
                  <span className="dsc-row-val" style={{ color:'#10b981' }}>Included ✓</span>
                </div>
              )}
            </div>

            <div className="dsc-divider" />

            <div className="dsc-rating">
              <div className="dsc-rating-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ color: i < Math.floor(data.rating) ? '#f59e0b' : 'var(--border-md)', fontSize:20 }}>★</span>
                ))}
              </div>
              <span className="dsc-rating-val">{data.rating}</span>
              <span className="dsc-rating-count">({data.reviews} reviews)</span>
            </div>
          </div>
        </aside>
      </div>

      <Footer />
      {applying && <ApplyModal item={data} onClose={() => setApplying(false)} />}
    </>
  )
}