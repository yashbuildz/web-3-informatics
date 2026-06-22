// ═══════════════════════════════════════════════════════════════════════════
//  ApplyModal.tsx  — Enhanced 3-step application modal
//  Drop this file in the same folder as page.tsx and import it there.
//
//  What it does:
//   Step 1 — Personal info (name, email, phone, college, year)
//   Step 2 — Motivation (skill tags, why text w/ char meter, portfolio link)
//   Step 3 — Review + submit
//
//  On submit it calls  POST /api/apply  which:
//   • Saves the application to Sanity (see sanity-schema.ts)
//   • Emails a confirmation to the applicant via Resend (see route.ts)
// ═══════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ── types ────────────────────────────────────────────────────────────────────

interface Internship {
  _id: string; title: string; domain: string; duration: string
  tier: string; price: number; icon?: string; mode: string
}

interface Props { item: Internship; onClose: () => void }

type Step = 1 | 2 | 3

interface FormData {
  name: string; email: string; phone: string
  college: string; year: string
  skills: string[]; why: string; portfolio: string
}

// ── skill options ─────────────────────────────────────────────────────────────

const SKILL_OPTIONS = [
  'React / Next.js', 'Node.js', 'Python', 'Databases',
  'TypeScript', 'DevOps', 'Mobile', 'No experience yet',
]

// ── icons ─────────────────────────────────────────────────────────────────────

const CheckIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const ArrowRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
const LinkIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
const MailIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>

const STEP_LABELS: Record<Step, string> = {
  1: 'Personal info',
  2: 'Motivation',
  3: 'Review',
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ApplyModal({ item, onClose }: Props) {
  const [step, setStep]           = useState<Step>(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const overlayRef                = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', college: '', year: '',
    skills: [], why: '', portfolio: '',
  })

  const set = useCallback(<K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm(f => ({ ...f, [k]: v }))
  }, [])

  const toggleSkill = (skill: string) => {
    set('skills', form.skills.includes(skill)
      ? form.skills.filter(s => s !== skill)
      : [...form.skills, skill]
    )
  }

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── validation ──
  const step1Valid = form.name.trim().length > 1 && /\S+@\S+\.\S+/.test(form.email)
  const step2Valid = form.why.trim().length >= 40
  const WHY_MAX    = 600
  const whyPct     = Math.min((form.why.length / WHY_MAX) * 100, 100)

  // ── progress bar width ──
  const progressWidth = submitted ? '100%' : `${((step - 1) / 3) * 100 + 16}%`

  // ── submit ──
  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internshipId:    item._id,
          internshipTitle: item.title,
          internshipDomain: item.domain,
          internshipDuration: item.duration,
          internshipTier:  item.tier,
          internshipPrice: item.price,
          ...form,
        }),
      })
      if (!res.ok) {
        const { message } = await res.json().catch(() => ({}))
        throw new Error(message || 'Submission failed. Please try again.')
      }
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── price display ──
  const priceLabel = item.price === 0 ? 'Free' : `₹${item.price.toLocaleString()}`

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="modal-box" role="dialog" aria-modal="true" aria-label={`Apply for ${item.title}`}>

        {/* ── Dark header band ── */}
        <div className="modal-header-band">
          <div className="modal-band-glow-left" />
          <div className="modal-band-glow-right" />

          <div className="modal-header-inner">
            <div className="modal-header-left">
              <div className="modal-icon-box">{item.icon || '🚀'}</div>
              <div>
                <div className="modal-title">{item.title}</div>
                <div className="modal-sub">
                  <span>{item.domain}</span>
                  <span className="modal-sub-dot" />
                  <span>{item.duration}</span>
                  <span className="modal-sub-dot" />
                  <span>{priceLabel}</span>
                </div>
              </div>
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
          </div>

          {/* Stepper */}
          {!submitted && (
            <div className="modal-stepper">
              {([1, 2, 3] as Step[]).map(s => (
                <div
                  key={s}
                  className={`modal-step ${step === s ? 'active' : ''} ${step > s ? 'done' : ''}`}
                >
                  <div className="modal-step-num">
                    {step > s ? <CheckIcon /> : s}
                  </div>
                  <div className="modal-step-label">{STEP_LABELS[s]}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Progress bar ── */}
        <div
          className="modal-progress-bar"
          style={{ width: progressWidth }}
          role="progressbar"
          aria-valuenow={step}
          aria-valuemax={3}
        />

        {/* ═══ SUCCESS ═══ */}
        {submitted ? (
          <div className="modal-success">
            <div className="modal-success-ring">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="modal-success-title">Application submitted!</div>
            <div className="modal-success-pill">
              <CheckIcon /> Under review
            </div>
            <div className="modal-success-sub">
              Thanks, <strong>{form.name.split(' ')[0]}</strong>! Your application for{' '}
              <strong>{item.title}</strong> is in. We&apos;ll get back to you within 2–3 business days.
            </div>
            <div className="modal-success-email-badge">
              <MailIcon />
              Confirmation sent to {form.email}
            </div>
            <button className="modal-done-btn" onClick={onClose}>Back to internship</button>
          </div>

        ) : (
          <div className="modal-body">

            {/* ═══ STEP 1 — Personal info ═══ */}
            {step === 1 && (
              <>
                <div className="modal-section-eyebrow">Step 1 of 3 · Your details</div>
                <div className="modal-fields">
                  <div className="modal-field">
                    <label>Full name <span className="modal-req">*</span></label>
                    <input
                      autoFocus required
                      placeholder="Ravi Kumar"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      suppressHydrationWarning
                    />
                  </div>

                  <div className="modal-field">
                    <label>Email address <span className="modal-req">*</span></label>
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
                        type="tel"
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
                      placeholder="e.g. 3rd year B.Tech CSE"
                      value={form.year}
                      onChange={e => set('year', e.target.value)}
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="modal-btn-primary"
                    disabled={!step1Valid}
                    onClick={() => { if (step1Valid) setStep(2) }}
                  >
                    Continue <ArrowRight />
                  </button>
                </div>
              </>
            )}

            {/* ═══ STEP 2 — Motivation ═══ */}
            {step === 2 && (
              <>
                <div className="modal-section-eyebrow">Step 2 of 3 · Motivation</div>
                <div className="modal-fields">
                  <div className="modal-field">
                    <label>Relevant skills — select all that apply</label>
                    <div className="modal-tag-group">
                      {SKILL_OPTIONS.map(skill => (
                        <button
                          key={skill}
                          type="button"
                          className={`modal-tag ${form.skills.includes(skill) ? 'active' : ''}`}
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="modal-field">
                    <label>Why do you want to join? <span className="modal-req">*</span></label>
                    <textarea
                      required rows={6}
                      placeholder="Tell us what excites you about this internship, your relevant projects, and what you hope to learn. Be specific — great applications stand out!"
                      value={form.why}
                      onChange={e => set('why', e.target.value)}
                    />
                    <div className="modal-char-wrap">
                      <div className="modal-char-track">
                        <div
                          className={`modal-char-fill ${form.why.length >= 40 ? 'full' : ''}`}
                          style={{ width: `${whyPct}%` }}
                        />
                      </div>
                      <div className="modal-char-hint">
                        <span>
                          {form.why.length < 40
                            ? `${40 - form.why.length} more characters needed`
                            : 'Looks great — keep going if you want!'
                          }
                        </span>
                        <span className={`modal-char-count ${form.why.length >= 40 ? 'full' : ''}`}>
                          {form.why.length} / {WHY_MAX}+
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-field">
                    <label>Portfolio / GitHub link</label>
                    <div className="modal-input-wrap">
                      <span className="modal-input-icon"><LinkIcon /></span>
                      <input
                        type="url"
                        className="with-icon"
                        placeholder="https://github.com/yourusername"
                        value={form.portfolio}
                        onChange={e => set('portfolio', e.target.value)}
                        suppressHydrationWarning
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="modal-btn-secondary" onClick={() => setStep(1)}>← Back</button>
                  <button
                    className="modal-btn-primary"
                    disabled={!step2Valid}
                    onClick={() => { if (step2Valid) setStep(3) }}
                  >
                    Review <ArrowRight />
                  </button>
                </div>
              </>
            )}

            {/* ═══ STEP 3 — Review ═══ */}
            {step === 3 && (
              <>
                <div className="modal-section-eyebrow">Step 3 of 3 · Review & submit</div>

                <div className="modal-review-card">
                  <div className="modal-review-row">
                    <span className="modal-review-label">Name</span>
                    <span className="modal-review-val">{form.name}</span>
                  </div>
                  <div className="modal-review-row">
                    <span className="modal-review-label">Email</span>
                    <span className="modal-review-val">{form.email}</span>
                  </div>
                  {form.phone && (
                    <div className="modal-review-row">
                      <span className="modal-review-label">Phone</span>
                      <span className="modal-review-val">{form.phone}</span>
                    </div>
                  )}
                  {form.college && (
                    <div className="modal-review-row">
                      <span className="modal-review-label">College</span>
                      <span className="modal-review-val">{form.college}</span>
                    </div>
                  )}
                  {form.year && (
                    <div className="modal-review-row">
                      <span className="modal-review-label">Year</span>
                      <span className="modal-review-val">{form.year}</span>
                    </div>
                  )}
                  {form.skills.length > 0 && (
                    <div className="modal-review-row">
                      <span className="modal-review-label">Skills</span>
                      <span className="modal-review-val">{form.skills.join(', ')}</span>
                    </div>
                  )}
                  <div className="modal-review-row">
                    <span className="modal-review-label">Motivation</span>
                    <span className="modal-review-val" style={{ maxWidth: 280 }}>
                      {form.why.length > 120 ? form.why.slice(0, 120) + '…' : form.why}
                    </span>
                  </div>
                  {form.portfolio && (
                    <div className="modal-review-row">
                      <span className="modal-review-label">Portfolio</span>
                      <span className="modal-review-val">{form.portfolio}</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div style={{
                    padding: '12px 14px', borderRadius: 10, marginBottom: 16,
                    background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
                    fontSize: 13, color: '#ef4444',
                  }}>
                    {error}
                  </div>
                )}

                <div className="modal-actions">
                  <button className="modal-btn-secondary" onClick={() => setStep(2)}>← Edit</button>
                  <button
                    className={`modal-btn-primary ${loading ? 'loading' : ''}`}
                    disabled={loading}
                    onClick={handleSubmit}
                  >
                    {loading
                      ? <><div className="modal-spinner" /> Submitting…</>
                      : <>Submit application <ArrowRight /></>
                    }
                  </button>
                </div>
              </>
            )}

          </div>
        )}
      </div>
    </div>
  )
}