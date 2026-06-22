'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import Link from 'next/link'
import './internships.css'

// ── Sanity client ──────────────────────────────────────────────────────────

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)
function urlFor(source: any) {
  return builder.image(source)
}

const QUERY = `*[_type == "internship"] | order(_createdAt desc) {
  _id, title, domain, duration, tier, price, rating, reviews,
  skills, icon, bgClass, mode, seats, startDate, hot, isNew, description,
  "slug": slug.current,
  "imageUrl": image.asset->url,
  image
}`

// ── Types ──────────────────────────────────────────────────────────────────

interface Internship {
  _id:       string
  title:     string
  domain:    string
  duration:  string
  tier:      'Free' | 'Pro' | 'Elite'
  price:     number
  rating:    number
  reviews:   number
  skills:    string[]
  icon:      string
  bgClass:   string
  mode:      'Remote' | 'Hybrid' | 'On-site'
  seats:     number
  startDate: string
  hot?:      boolean
  isNew?:    boolean
  description?: string
  slug?:     string
  imageUrl?: string
  image?:    any
}

// ── Fallback data ──────────────────────────────────────────────────────────

const FALLBACK: Internship[] = [
  { _id:'1',  title:'AI & Machine Learning',       domain:'Artificial Intelligence', duration:'8 weeks',  tier:'Free',  price:0,    rating:4.9, reviews:310, skills:['Python','TensorFlow','ML'],         icon:'🤖', bgClass:'bg-violet',  mode:'Remote',  seats:12, startDate:'May 1',  hot:true,  slug:'ai-machine-learning'       },
  { _id:'2',  title:'Full Stack Web Development',  domain:'Web Development',         duration:'10 weeks', tier:'Pro',   price:1499, rating:4.8, reviews:240, skills:['React','Node.js','MongoDB'],         icon:'💻', bgClass:'bg-blue',    mode:'Remote',  seats:8,  startDate:'May 5',  hot:true,  slug:'full-stack-web-development' },
  { _id:'3',  title:'Data Science & Analytics',    domain:'Data Science',            duration:'12 weeks', tier:'Elite', price:2999, rating:4.9, reviews:185, skills:['Python','SQL','Tableau'],            icon:'📊', bgClass:'bg-emerald', mode:'Remote',  seats:6,  startDate:'May 10',            slug:'data-science-analytics'     },
  { _id:'4',  title:'UI/UX Design',                domain:'Design',                  duration:'6 weeks',  tier:'Pro',   price:1499, rating:4.7, reviews:143, skills:['Figma','Prototyping','Research'],    icon:'🎨', bgClass:'bg-pink',    mode:'Hybrid',  seats:15, startDate:'May 3',  isNew:true,slug:'ui-ux-design'               },
  { _id:'5',  title:'Ethical Hacking & Security',  domain:'Cybersecurity',           duration:'8 weeks',  tier:'Elite', price:2999, rating:4.8, reviews:98,  skills:['Kali Linux','Pentesting','CTF'],     icon:'🔐', bgClass:'bg-amber',   mode:'Remote',  seats:5,  startDate:'May 15',            slug:'ethical-hacking-security'   },
  { _id:'6',  title:'Digital Marketing & SEO',     domain:'Marketing',               duration:'6 weeks',  tier:'Pro',   price:1499, rating:4.6, reviews:210, skills:['Meta Ads','SEO','Analytics'],        icon:'📱', bgClass:'bg-rose',    mode:'Remote',  seats:20, startDate:'May 2',  isNew:true,slug:'digital-marketing-seo'      },
  { _id:'7',  title:'Blockchain & Web3',           domain:'Blockchain',              duration:'10 weeks', tier:'Elite', price:2999, rating:4.9, reviews:76,  skills:['Solidity','Smart Contracts','DeFi'], icon:'⛓️', bgClass:'bg-cyan',    mode:'Remote',  seats:4,  startDate:'May 20',            slug:'blockchain-web3'            },
  { _id:'8',  title:'Product Management',          domain:'Management',              duration:'8 weeks',  tier:'Pro',   price:1499, rating:4.7, reviews:130, skills:['Agile','Roadmaps','Research'],       icon:'🧪', bgClass:'bg-orange',  mode:'Hybrid',  seats:10, startDate:'May 8',             slug:'product-management'         },
  { _id:'9',  title:'Cloud Computing & DevOps',    domain:'Cloud',                   duration:'10 weeks', tier:'Elite', price:2999, rating:4.8, reviews:88,  skills:['AWS','Docker','Kubernetes'],         icon:'☁️', bgClass:'bg-sky',     mode:'Remote',  seats:7,  startDate:'May 12',            slug:'cloud-computing-devops'     },
  { _id:'10', title:'Android App Development',     domain:'Mobile Dev',              duration:'8 weeks',  tier:'Pro',   price:1499, rating:4.6, reviews:165, skills:['Kotlin','Jetpack','Firebase'],       icon:'📲', bgClass:'bg-green',   mode:'Remote',  seats:9,  startDate:'May 6',             slug:'android-app-development'    },
]

// ── Filter options ─────────────────────────────────────────────────────────

const DOMAINS   = ['All','Artificial Intelligence','Web Development','Data Science','Design','Cybersecurity','Marketing','Blockchain','Management','Cloud','Mobile Dev']
const TIERS     = ['All','Free','Pro','Elite']
const MODES     = ['All','Remote','Hybrid','On-site']
const SORT_OPTS = ['Most Popular','Highest Rated','Price: Low to High','Price: High to Low']

const tierColor: Record<string,string> = { Free:'tier-free', Pro:'tier-pro', Elite:'tier-elite' }
const modeColor: Record<string,string> = { Remote:'mode-remote', Hybrid:'mode-hybrid', 'On-site':'mode-onsite' }

// ── Fallback gradient bg per bgClass ──────────────────────────────────────
const bgGradients: Record<string,string> = {
  'bg-violet':  'linear-gradient(135deg,#ede9fe,#c4b5fd)',
  'bg-blue':    'linear-gradient(135deg,#dbeafe,#93c5fd)',
  'bg-emerald': 'linear-gradient(135deg,#d1fae5,#6ee7b7)',
  'bg-pink':    'linear-gradient(135deg,#fce7f3,#f9a8d4)',
  'bg-amber':   'linear-gradient(135deg,#fef3c7,#fcd34d)',
  'bg-rose':    'linear-gradient(135deg,#fee2e2,#fca5a5)',
  'bg-cyan':    'linear-gradient(135deg,#cffafe,#67e8f9)',
  'bg-orange':  'linear-gradient(135deg,#fff7ed,#fed7aa)',
  'bg-sky':     'linear-gradient(135deg,#e0f2fe,#7dd3fc)',
  'bg-green':   'linear-gradient(135deg,#f0fdf4,#86efac)',
}

// ── Icons ──────────────────────────────────────────────────────────────────

function BoltIcon({ fill='currentColor' }: { fill?: string }) {
  return <svg viewBox="0 0 24 24" fill={fill}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
}
function ChevronDown({ style }: { style?: React.CSSProperties }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style ?? {width:14,height:14}}><path d="M6 9l6 6 6-6"/></svg>
}
function ChevronLeft() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><path d="M15 18l-6-6 6-6"/></svg>
}
function SunIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round" style={{width:10,height:10}}><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
}
function MoonIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" style={{width:10,height:10}}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
}
function StarIcon()   { return <svg viewBox="0 0 24 24" className="star-icon"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> }
function SearchIcon({ style }: { style?: React.CSSProperties }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={style} className="search-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> }
function FilterIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg> }
function HeartIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> }
function ArrowRight() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M5 12h14M12 5l7 7-7 7"/></svg> }

// ── Nav ────────────────────────────────────────────────────────────────────

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button className="theme-toggle" onClick={onToggle} aria-label="Toggle dark mode">
      <div className="theme-toggle-thumb">{isDark ? <MoonIcon/> : <SunIcon/>}</div>
    </button>
  )
}

function Nav({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <nav>
      <Link href="/" className="nav-logo">
        <div className="nav-logo-icon"><BoltIcon fill="inherit"/></div>
        W3IS
      </Link>
      <div className="nav-center">
        <Link href="/internships" className="nav-dd">Internships <ChevronDown/></Link>
        <div className="nav-dd">Certificates <ChevronDown/></div>
        <div className="nav-dd">Projects <ChevronDown/></div>
      </div>
      <div className="nav-right">
        <div className="nav-link">List your company</div>
        <div className="nav-link">Sign in</div>
        <ThemeToggle isDark={isDark} onToggle={onToggle}/>
        <div className="nav-cta">Get started</div>
        <div className="nav-avatar">RK</div>
      </div>
    </nav>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────

function Footer() {
  const cols = [
    { title:'Solutions', links:['Internships','Certificates','Projects','Reports','Mentorship'] },
    { title:'Support',   links:['Getting started','Help center','Documentation','Guides','Status'] },
    { title:'Company',   links:['About','Blog','Jobs','Press','Partners'] },
    { title:'Legal',     links:['Terms of service','Privacy policy','Cookie policy','Licenses','Imprint'] },
  ]
  return (
    <footer>
      <div className="footer-top">
        <div>
          <div className="footer-brand"><div className="footer-brand-icon"><BoltIcon fill="#0a0a0a"/></div>W3IS</div>
          <div className="footer-desc">Making the world better through internships, one certificate at a time.</div>
          <div className="footer-socials">
            {[0,1,2,3].map(i=><div key={i} className="footer-social"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg></div>)}
          </div>
        </div>
        {cols.map(col=>(
          <div key={col.title}>
            <div className="footer-col-title">{col.title}</div>
            <div className="footer-links">{col.links.map(l=><div key={l} className="footer-link">{l}</div>)}</div>
          </div>
        ))}
      </div>
      <div className="footer-bottom"><div className="footer-copy">© 2026 Web3 Infomatics Solutions, Inc. All rights reserved.</div></div>
    </footer>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img skeleton-pulse"/>
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-pulse" style={{width:'60%',height:10}}/>
        <div className="skeleton-line skeleton-pulse" style={{width:'90%',height:14}}/>
        <div style={{display:'flex',gap:6,marginTop:8}}>
          <div className="skeleton-line skeleton-pulse" style={{width:50,height:22,borderRadius:20}}/>
          <div className="skeleton-line skeleton-pulse" style={{width:50,height:22,borderRadius:20}}/>
        </div>
        <div className="skeleton-line skeleton-pulse" style={{width:'40%',height:12,marginTop:12}}/>
      </div>
    </div>
  )
}

// ── Card ───────────────────────────────────────────────────────────────────

function InternshipCard({ item, view }: { item: Internship; view: 'grid'|'list' }) {
  const [saved, setSaved] = useState(false)
  const detailHref = `/internships/${item.slug || item._id}`

  // Image: use Sanity image if available, otherwise fallback gradient bg
  const cardImage = item.imageUrl
    ? <img src={item.imageUrl} alt={item.title} className="ilc-photo"/>
    : (item.image
        ? <img src={urlFor(item.image).width(600).height(340).url()} alt={item.title} className="ilc-photo"/>
        : <div className="ilc-fallback-bg" style={{background: bgGradients[item.bgClass] ?? bgGradients['bg-violet']}}>
            <span className="ilc-icon">{item.icon}</span>
          </div>
      )

  if (view === 'list') {
    return (
      <div className="list-card">
        <div className="list-card-thumb">
          {item.imageUrl || item.image
            ? <img src={item.imageUrl || urlFor(item.image).width(160).height(100).url()} alt={item.title} className="list-card-photo"/>
            : <div className="list-card-fallback" style={{background: bgGradients[item.bgClass] ?? bgGradients['bg-violet']}}>
                <span style={{fontSize:28}}>{item.icon}</span>
              </div>
          }
        </div>
        <div className="list-card-body">
          <div className="list-card-top">
            <div>
              <div className="list-card-domain">{item.domain} · {item.duration} · {item.mode}</div>
              <div className="list-card-title">{item.title}</div>
              <div className="list-card-skills">{item.skills?.map(s=><span key={s} className="skill-pill">{s}</span>)}</div>
            </div>
            <div className="list-card-right">
              <div className="list-card-price">
                {item.price===0 ? <span className="price-free">Free</span> : <span>₹{item.price.toLocaleString()}</span>}
                <span className="price-tier"> / {item.tier}</span>
              </div>
              <div className="list-card-meta-row">
                <span className={`tier-badge ${tierColor[item.tier]}`}>{item.tier}</span>
                <span className={`mode-badge ${modeColor[item.mode]}`}>{item.mode}</span>
              </div>
              <div className="list-card-rating"><StarIcon/> {item.rating} ({item.reviews})</div>
              <div className="list-card-actions">
                <button className="btn-save-list" onClick={()=>setSaved(!saved)} style={{color:saved?'#ef4444':undefined}}>
                  <HeartIcon/> {saved?'Saved':'Save'}
                </button>
                <Link href={detailHref} className="btn-details-list">Details <ArrowRight/></Link>
              </div>
            </div>
          </div>
          <div className="list-card-footer">
            <span className="seats-info">🪑 {item.seats} seats left</span>
            <span className="start-info">📅 Starts {item.startDate}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="int-listing-card">
      {/* ── Image area ── */}
      <div className="ilc-img">
        {cardImage}
        <div className="ilc-img-overlay"/>
        <div className="ilc-badges">
          {item.hot   && <span className="badge-hot">🔥 Hot</span>}
          {item.isNew && <span className="badge-new">✨ New</span>}
        </div>
        <button className="ilc-save" onClick={()=>setSaved(!saved)} style={{color:saved?'#ef4444':undefined}}>
          <HeartIcon/>
        </button>
        <div className="ilc-mode-overlay">
          <span className={`mode-badge ${modeColor[item.mode]}`}>{item.mode}</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="ilc-body">
        <div className="ilc-domain">{item.domain} · {item.duration}</div>
        <div className="ilc-title">{item.title}</div>
        <div className="ilc-skills">{item.skills?.slice(0,3).map(s=><span key={s} className="skill-pill">{s}</span>)}</div>
        <div className="ilc-footer">
          <div className="ilc-footer-left">
            <div className="ilc-price">
              {item.price===0 ? <span className="price-free">Free</span> : <span>₹{item.price.toLocaleString()}</span>}
              <span className="price-tier"> / {item.tier}</span>
            </div>
            <div className="ilc-rating"><StarIcon/> {item.rating} <span className="rating-count">({item.reviews})</span></div>
          </div>
          <Link href={detailHref} className="ilc-details">Details <ArrowRight/></Link>
        </div>
        <div className="ilc-bottom-row">
          <span className="seats-info">🪑 {item.seats} seats left</span>
          <span className="start-info">Starts {item.startDate}</span>
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────

function Sidebar({ collapsed, onToggle, domain, setDomain, tier, setTier, mode, setMode, maxPrice, setMaxPrice, onReset, activeFilters }:{
  collapsed: boolean; onToggle: ()=>void
  domain: string; setDomain:(v:string)=>void
  tier: string;   setTier:(v:string)=>void
  mode: string;   setMode:(v:string)=>void
  maxPrice: number; setMaxPrice:(v:number)=>void
  onReset:()=>void; activeFilters:string[]
}) {
  return (
    <div className={`sidebar-wrap ${collapsed?'collapsed':''}`}>
      <div className="sidebar-rail">
        <button className="sidebar-toggle" onClick={onToggle} title={collapsed?'Expand filters':'Collapse filters'}>
          <ChevronLeft/>
        </button>
        {collapsed && activeFilters.length > 0 && (
          <div className="sidebar-icon-pills">
            {activeFilters.slice(0,4).map(f=>(
              <div key={f} className="sidebar-icon-pill" title={f}>{f.slice(0,2).toUpperCase()}</div>
            ))}
          </div>
        )}
      </div>
      <div className="sidebar-content">
        <div className="sidebar-header-row">
          <span className="sidebar-title"><FilterIcon/> Filters</span>
          <div className="sidebar-header-right">
            {activeFilters.length > 0 && <button className="sidebar-reset" onClick={onReset}>Reset</button>}
            <button className="sidebar-toggle" onClick={onToggle}><ChevronLeft/></button>
          </div>
        </div>
        <div className="sidebar-filters">
          <div className="filter-group">
            <div className="filter-label">Domain</div>
            <div className="filter-pills">{DOMAINS.map(d=><button key={d} className={`filter-pill ${domain===d?'active':''}`} onClick={()=>setDomain(d)}>{d}</button>)}</div>
          </div>
          <div className="filter-group">
            <div className="filter-label">Tier</div>
            <div className="filter-pills">{TIERS.map(t=><button key={t} className={`filter-pill ${tier===t?'active':''}`} onClick={()=>setTier(t)}>{t}</button>)}</div>
          </div>
          <div className="filter-group">
            <div className="filter-label">Mode</div>
            <div className="filter-pills">{MODES.map(m=><button key={m} className={`filter-pill ${mode===m?'active':''}`} onClick={()=>setMode(m)}>{m}</button>)}</div>
          </div>
          <div className="filter-group">
            <div className="filter-label">Max Price: {maxPrice>=3000?'Any':maxPrice===0?'Free only':`₹${maxPrice.toLocaleString()}`}</div>
            <input type="range" min={0} max={3000} step={500} value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))} className="price-slider"/>
            <div className="price-range-labels"><span>Free</span><span>₹3,000</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function InternshipsPage() {
  const [isDark, setIsDark]           = useState(false)
  const [headerOpen, setHeaderOpen]   = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [data, setData]               = useState<Internship[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [domain, setDomain]           = useState('All')
  const [tier, setTier]               = useState('All')
  const [mode, setMode]               = useState('All')
  const [maxPrice, setMaxPrice]       = useState(3000)
  const [sort, setSort]               = useState('Most Popular')
  const [view, setView]               = useState<'grid'|'list'>('grid')

  const toggleTheme = () => {
    const next = !isDark; setIsDark(next)
    document.documentElement.setAttribute('data-theme', next?'dark':'light')
  }

  useEffect(() => {
    setLoading(true)
    client.fetch<Internship[]>(QUERY)
      .then(res => { setData(res?.length>0?res:FALLBACK); setLoading(false) })
      .catch(() => { setData(FALLBACK); setLoading(false) })
  }, [])

  const resetFilters = () => { setDomain('All'); setTier('All'); setMode('All'); setMaxPrice(3000); setSearch('') }

  const filtered = useMemo(() => {
    let list = [...data]
    if (search)           list = list.filter(i=>i.title.toLowerCase().includes(search.toLowerCase())||i.domain.toLowerCase().includes(search.toLowerCase())||i.skills?.some(s=>s.toLowerCase().includes(search.toLowerCase())))
    if (domain!=='All')   list = list.filter(i=>i.domain===domain)
    if (tier!=='All')     list = list.filter(i=>i.tier===tier)
    if (mode!=='All')     list = list.filter(i=>i.mode===mode)
    if (maxPrice<3000)    list = list.filter(i=>i.price<=maxPrice)
    switch(sort) {
      case 'Highest Rated':      list.sort((a,b)=>b.rating-a.rating);  break
      case 'Price: Low to High': list.sort((a,b)=>a.price-b.price);    break
      case 'Price: High to Low': list.sort((a,b)=>b.price-a.price);    break
      default:                   list.sort((a,b)=>b.reviews-a.reviews)
    }
    return list
  }, [data, search, domain, tier, mode, maxPrice, sort])

  const activeFilters = [domain!=='All'&&domain,tier!=='All'&&tier,mode!=='All'&&mode,maxPrice<3000&&`≤₹${maxPrice}`].filter(Boolean) as string[]
  const hasFilters = activeFilters.length>0||search.length>0

  return (
    <>
      <Nav isDark={isDark} onToggle={toggleTheme}/>
      <div className="listings-page">

        {/* ── Collapsible header ── */}
        <div className="listings-header">
          <div className="listings-header-bar">
            <div className="listings-header-bar-left">
              <div className="listings-title-group">
                <div className="listings-h1">Find your internship</div>
                <div className="listings-sub">{loading?'Loading…':`${data.length} verified · Certificates included`}</div>
              </div>
              {!headerOpen && (
                <div className="header-search-pill" onClick={()=>setHeaderOpen(true)}>
                  <SearchIcon style={{width:15,height:15}}/>
                  {search?search:'Search internships…'}
                </div>
              )}
            </div>
            <div className="listings-header-bar-right">
              <div className="listings-stats">
                <div className="lstat"><span className="lstat-val">500+</span><span className="lstat-label">Students</span></div>
                <div className="lstat"><span className="lstat-val">4.8★</span><span className="lstat-label">Rating</span></div>
                <div className="lstat"><span className="lstat-val">100%</span><span className="lstat-label">Verified</span></div>
              </div>
              <button className={`header-toggle-btn ${headerOpen?'expanded':''}`} onClick={()=>setHeaderOpen(o=>!o)}>
                {hasFilters&&!headerOpen&&<span className="filter-dot"/>}
                {headerOpen?'Collapse':'Search & Filter'}
                <ChevronDown/>
              </button>
            </div>
          </div>
          <div className={`listings-header-panel ${headerOpen?'open':''}`}>
            <div className="search-bar-wrap">
              <div className="search-bar">
                <SearchIcon/>
                <input className="search-input" placeholder="Search by title, domain, or skill…" value={search} onChange={e=>setSearch(e.target.value)} suppressHydrationWarning autoFocus={headerOpen}/>
                {search&&<button className="search-clear" onClick={()=>setSearch('')}>✕</button>}
              </div>
            </div>
            {activeFilters.length>0&&(
              <div className="active-chips">
                {activeFilters.map(f=><span key={f} className="active-chip">{f} <button onClick={resetFilters}>✕</button></span>)}
                <button className="clear-all" onClick={resetFilters}>Clear all</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="listings-body">
          <Sidebar collapsed={sidebarCollapsed} onToggle={()=>setSidebarCollapsed(c=>!c)} domain={domain} setDomain={setDomain} tier={tier} setTier={setTier} mode={mode} setMode={setMode} maxPrice={maxPrice} setMaxPrice={setMaxPrice} onReset={resetFilters} activeFilters={activeFilters}/>

          <main className="listings-main">
            <div className="listings-toolbar">
              <span className="results-count">{loading?'Loading…':`${filtered.length} internship${filtered.length!==1?'s':''} found`}</span>
              <div className="toolbar-right">
                <select className="sort-select" value={sort} onChange={e=>setSort(e.target.value)}>
                  {SORT_OPTS.map(o=><option key={o}>{o}</option>)}
                </select>
                <div className="view-toggle">
                  <button className={`view-btn ${view==='grid'?'active':''}`} onClick={()=>setView('grid')}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  </button>
                  <button className={`view-btn ${view==='list'?'active':''}`} onClick={()=>setView('list')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="int-listing-grid">{Array.from({length:6}).map((_,i)=><SkeletonCard key={i}/>)}</div>
            ) : filtered.length===0 ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <div className="no-results-title">No internships found</div>
                <div className="no-results-sub">Try adjusting your filters or search query</div>
                <button className="no-results-btn" onClick={resetFilters}>Clear all filters</button>
              </div>
            ) : view==='grid' ? (
              <div className="int-listing-grid">{filtered.map(item=><InternshipCard key={item._id} item={item} view="grid"/>)}</div>
            ) : (
              <div className="int-listing-list">{filtered.map(item=><InternshipCard key={item._id} item={item} view="list"/>)}</div>
            )}
          </main>
        </div>
      </div>
      <Footer/>
    </>
  )
}