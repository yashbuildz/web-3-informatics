"use client";

import { useState, useEffect, useRef } from "react";
import "./page.css";
import Link from "next/link";
import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import {
  TestimonialsSection,
  CertificateSection,
  PartnersSection,
  FAQSection,
  CTASection,
} from "./HomeSections";

// ── Sanity ─────────────────────────────────────────────────────────────────

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: true,
});

const builder = createImageUrlBuilder(client);
function urlFor(source: any) { return builder.image(source); }

const SLIDER_QUERY = `*[_type == "internship"] | order(_createdAt desc)[0...12] {
  _id, title, domain, duration, tier, price, rating, reviews,
  skills, icon, bgClass, mode, seats, startDate, hot, isNew,
  "slug": slug.current,
  "imageUrl": image.asset->url,
  image
}`;

// ── Types ──────────────────────────────────────────────────────────────────

interface SanityInternship {
  _id: string;
  title: string;
  domain: string;
  duration: string;
  tier: "Free" | "Pro" | "Elite";
  price: number;
  rating: number;
  reviews: number;
  skills: string[];
  icon: string;
  bgClass: string;
  mode: "Remote" | "Hybrid" | "On-site";
  seats: number;
  startDate: string;
  hot?: boolean;
  isNew?: boolean;
  slug?: string;
  imageUrl?: string;
  image?: any;
}

interface Mentor {
  emoji: string;
  imgClass: string;
  available: boolean;
  name: string;
  role: string;
}

// ── Fallback slider data ───────────────────────────────────────────────────

const FALLBACK_SLIDER: SanityInternship[] = [
  { _id:"1",  title:"Full Stack Development Pro",        domain:"Web Development",         duration:"10 weeks", tier:"Pro",   price:1499, rating:4.8, reviews:240, skills:["React","Node.js","MongoDB"],         icon:"💻", bgClass:"bg-blue",    mode:"Remote",  seats:8,  startDate:"May 5",  hot:true,  slug:"full-stack-web-development" },
  { _id:"2",  title:"AI & Machine Learning",             domain:"Artificial Intelligence", duration:"8 weeks",  tier:"Free",  price:0,    rating:4.9, reviews:310, skills:["Python","TensorFlow","ML"],          icon:"🤖", bgClass:"bg-violet",  mode:"Remote",  seats:12, startDate:"May 1",  hot:true,  slug:"ai-machine-learning"        },
  { _id:"3",  title:"Data Science & Analytics Elite",    domain:"Data Science",            duration:"12 weeks", tier:"Elite", price:2999, rating:4.9, reviews:185, skills:["Python","SQL","Tableau"],             icon:"📊", bgClass:"bg-emerald", mode:"Remote",  seats:6,  startDate:"May 10",            slug:"data-science-analytics"     },
  { _id:"4",  title:"UI/UX Design Internship",           domain:"Design",                  duration:"6 weeks",  tier:"Pro",   price:1499, rating:4.7, reviews:143, skills:["Figma","Prototyping","Research"],     icon:"🎨", bgClass:"bg-pink",    mode:"Hybrid",  seats:15, startDate:"May 3",  isNew:true,slug:"ui-ux-design"               },
  { _id:"5",  title:"Ethical Hacking & Security",        domain:"Cybersecurity",           duration:"8 weeks",  tier:"Elite", price:2999, rating:4.8, reviews:98,  skills:["Kali Linux","Pentesting","CTF"],      icon:"🔐", bgClass:"bg-amber",   mode:"Remote",  seats:5,  startDate:"May 15",            slug:"ethical-hacking-security"   },
  { _id:"6",  title:"Social Media & SEO Internship",     domain:"Marketing",               duration:"6 weeks",  tier:"Pro",   price:1499, rating:4.6, reviews:210, skills:["Meta Ads","SEO","Analytics"],         icon:"📱", bgClass:"bg-rose",    mode:"Remote",  seats:20, startDate:"May 2",  isNew:true,slug:"digital-marketing-seo"      },
  { _id:"7",  title:"Blockchain & Web3 Internship",      domain:"Blockchain",              duration:"10 weeks", tier:"Elite", price:2999, rating:4.9, reviews:76,  skills:["Solidity","Smart Contracts","DeFi"],  icon:"⛓️", bgClass:"bg-cyan",    mode:"Remote",  seats:4,  startDate:"May 20",            slug:"blockchain-web3"            },
  { _id:"8",  title:"Product Management Internship",     domain:"Management",              duration:"8 weeks",  tier:"Pro",   price:1499, rating:4.7, reviews:130, skills:["Agile","Roadmaps","Research"],        icon:"🧪", bgClass:"bg-orange",  mode:"Hybrid",  seats:10, startDate:"May 8",             slug:"product-management"         },
];

// ── bg gradients for fallback ──────────────────────────────────────────────

const bgGradients: Record<string, string> = {
  "bg-violet":  "linear-gradient(135deg,#ede9fe,#c4b5fd)",
  "bg-blue":    "linear-gradient(135deg,#dbeafe,#93c5fd)",
  "bg-emerald": "linear-gradient(135deg,#d1fae5,#6ee7b7)",
  "bg-pink":    "linear-gradient(135deg,#fce7f3,#f9a8d4)",
  "bg-amber":   "linear-gradient(135deg,#fef3c7,#fcd34d)",
  "bg-rose":    "linear-gradient(135deg,#fee2e2,#fca5a5)",
  "bg-cyan":    "linear-gradient(135deg,#cffafe,#67e8f9)",
  "bg-orange":  "linear-gradient(135deg,#fff7ed,#fed7aa)",
  "bg-sky":     "linear-gradient(135deg,#e0f2fe,#7dd3fc)",
  "bg-green":   "linear-gradient(135deg,#f0fdf4,#86efac)",
};

const mentors: Mentor[] = [
  { emoji:"👨‍💻", imgClass:"community-card-img-1", available:true,  name:"Ravi Kumar",   role:"Developer"      },
  { emoji:"👩‍🎨", imgClass:"community-card-img-2", available:true,  name:"Priya Sharma", role:"Designer"       },
  { emoji:"👨‍🔬", imgClass:"community-card-img-3", available:false, name:"Arjun Nair",   role:"Data Scientist" },
  { emoji:"👩‍💼", imgClass:"community-card-img-4", available:true,  name:"Sneha Patel",  role:"PM"             },
  { emoji:"👨‍🏫", imgClass:"community-card-img-5", available:true,  name:"Vikram Das",   role:"Instructor"     },
  { emoji:"👩‍💻", imgClass:"community-card-img-2", available:false, name:"Anjali Rao",   role:"Developer"      },
  { emoji:"👨‍🎓", imgClass:"community-card-img-3", available:true,  name:"Karan Singh",  role:"Mentor"         },
  { emoji:"👩‍🔬", imgClass:"community-card-img-1", available:true,  name:"Meera Iyer",   role:"Analyst"        },
  { emoji:"👨‍💼", imgClass:"community-card-img-4", available:false, name:"Rahul Mehta",  role:"Strategist"     },
  { emoji:"👩‍🏫", imgClass:"community-card-img-5", available:true,  name:"Divya Nair",   role:"Instructor"     },
];

const trackCards = [
  { id:"left",    img:"https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800", title:"AI & Machine Learning",    count:"180+ students", span:"tall"  },
  { id:"mid-top", img:"https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800",  title:"Full Stack Web Dev",        count:"240+ students", span:"half"  },
  { id:"mid-bot", img:"https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800",title:"Data Science & Analytics",  count:"120+ students", span:"half"  },
  { id:"right",   img:"https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800",  title:"UI / UX Design",            count:"95+ students",  span:"tall"  },
];

// ── SVG helpers ────────────────────────────────────────────────────────────

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width:12, height:12, fill:"#f59e0b" }}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const BoltIcon = ({ fill = "currentColor" }: { fill?: string }) => (
  <svg viewBox="0 0 24 24" fill={fill}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round">
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// ── Sub-components ─────────────────────────────────────────────────────────

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button className="theme-toggle" onClick={onToggle} aria-label="Toggle dark mode">
      <div className="theme-toggle-thumb">
        {isDark ? <MoonIcon /> : <SunIcon />}
      </div>
    </button>
  );
}

function Nav({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className={`nav2 ${scrolled ? 'nav2-scrolled' : ''}`}>
        {/* Logo — both images stacked; CSS swipe handles the transition */}
        <Link href="/" className="nav2-logo">
          <div className="nav2-logo-swap">
            <img
              src="/logos/logo-light.png"
              alt="Web3 Infomatics Solutions"
              className={`nav2-logo-img nav2-logo-light ${isDark ? 'logo-exit-left' : 'logo-enter'}`}
            />
            <img
              src="/logos/logo-dark.png"
              alt="Web3 Infomatics Solutions"
              className={`nav2-logo-img nav2-logo-dark ${isDark ? 'logo-enter' : 'logo-exit-left'}`}
            />
          </div>
        </Link>

        {/* Center links */}
        <div className="nav2-links">
          <Link href="/internships" className="nav2-link nav2-link-active">
            <svg viewBox="0 0 20 20" fill="currentColor" width={15} height={15}>
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5 8.31V11a1 1 0 00.553.894l4 2a1 1 0 00.894 0l4-2A1 1 0 0015 11V8.31l2.394-1.026a1 1 0 000-1.84l-7-3zM13 10.382l-3 1.5-3-1.5V9.19l3 1.286 3-1.286v1.192z"/>
            </svg>
            Internships
            <span className="nav2-link-dot" />
          </Link>
          <div className="nav2-link">
            <svg viewBox="0 0 20 20" fill="currentColor" width={15} height={15}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            About
            <span className="nav2-link-dot" />
          </div>
          <div className="nav2-link">
            <svg viewBox="0 0 20 20" fill="currentColor" width={15} height={15}>
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            Contact
            <span className="nav2-link-dot" />
          </div>
        </div>

        {/* Right side */}
        <div className="nav2-right">
          <ThemeToggle isDark={isDark} onToggle={onToggle} />
          <Link href="/internships" className="nav2-cta">
            Browse Internships
            <svg viewBox="0 0 16 16" fill="none" width={13} height={13}>
              <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          {/* Mobile hamburger */}
          <button className="nav2-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span className={menuOpen ? 'open' : ''} />
            <span className={menuOpen ? 'open' : ''} />
            <span className={menuOpen ? 'open' : ''} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`nav2-drawer ${menuOpen ? 'open' : ''}`}>
        <Link href="/internships" className="nav2-drawer-link" onClick={() => setMenuOpen(false)}>Internships</Link>
        <div className="nav2-drawer-link">About</div>
        <div className="nav2-drawer-link">Contact</div>
        <Link href="/internships" className="nav2-drawer-cta" onClick={() => setMenuOpen(false)}>Browse Internships →</Link>
      </div>
    </>
  );
}

function Hero() {
  return (
    <div className="hero-wrapper">
      <div className="hero">
        {/* Hero text */}
        <div className="hero-content">
          <div className="hero-tag">Internships · Certificates · Projects · Reports</div>
          <div className="hero-h1">New generation<br />of internships</div>
          <div className="hero-sub">Keep calm &amp; intern on</div>
          <button className="hero-cta">
            <div className="hero-cta-icon"><ArrowRight /></div>
            Explore internships
          </button>
        </div>
      </div>
    </div>
  );
}

function FeaturedTracks() {
  return (
    <section className="tracks-section">
      <div className="tracks-grid">
        <div className="track-card track-card-tall">
          <img src={trackCards[0].img} alt={trackCards[0].title} className="track-card-img" />
          <div className="track-card-overlay" />
          <div className="track-card-text">
            <div className="track-card-title">{trackCards[0].title}</div>
            <div className="track-card-count">{trackCards[0].count}</div>
          </div>
        </div>
        <div className="tracks-mid-col">
          {[trackCards[1], trackCards[2]].map((card) => (
            <div key={card.id} className="track-card track-card-half">
              <img src={card.img} alt={card.title} className="track-card-img" />
              <div className="track-card-overlay" />
              <div className="track-card-text">
                <div className="track-card-title">{card.title}</div>
                <div className="track-card-count">{card.count}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="track-card track-card-tall">
          <img src={trackCards[3].img} alt={trackCards[3].title} className="track-card-img" />
          <div className="track-card-overlay" />
          <div className="track-card-text">
            <div className="track-card-title">{trackCards[3].title}</div>
            <div className="track-card-count">{trackCards[3].count}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      id: 1, title: "Choose Your Track",
      desc: "Browse 50+ internship tracks across AI, Web Dev, Design, Marketing and more. Pick what excites you.",
      color: "#e0f0ff", accent: "#3b82f6",
      icon: (
        <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" width="110" height="110">
          <circle cx="55" cy="55" r="52" fill="#bfdbfe" />
          <circle cx="78" cy="26" r="12" fill="#fbbf24" />
          <line x1="78" y1="10" x2="78" y2="6" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="78" y1="44" x2="78" y2="48" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="62" y1="26" x2="58" y2="26" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="94" y1="26" x2="98" y2="26" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="30" cy="30" rx="14" ry="7" fill="white" opacity="0.85" />
          <ellipse cx="22" cy="32" rx="9" ry="6" fill="white" opacity="0.85" />
          <ellipse cx="38" cy="32" rx="9" ry="6" fill="white" opacity="0.85" />
          <rect x="18" y="52" width="58" height="36" rx="5" fill="#1e3a5f" />
          <rect x="22" y="56" width="50" height="28" rx="3" fill="#3b82f6" />
          <rect x="28" y="61" width="20" height="3" rx="1.5" fill="white" opacity="0.9" />
          <rect x="28" y="67" width="14" height="2.5" rx="1.25" fill="white" opacity="0.5" />
          <rect x="28" y="73" width="17" height="2.5" rx="1.25" fill="white" opacity="0.5" />
          <circle cx="60" cy="70" r="8" fill="#22c55e" />
          <path d="M55.5 70l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="14" y="88" width="66" height="5" rx="2.5" fill="#16304e" />
        </svg>
      ),
    },
    {
      id: 2, title: "Apply & Enroll",
      desc: "Fill a quick application, choose your plan — Free or Pro — and get instant access to your internship portal.",
      color: "#fef9ec", accent: "#f59e0b",
      icon: (
        <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" width="110" height="110">
          <circle cx="55" cy="55" r="52" fill="#fde68a" />
          <circle cx="80" cy="28" r="10" fill="#f97316" />
          <rect x="22" y="30" width="52" height="62" rx="6" fill="white" />
          <rect x="38" y="24" width="20" height="12" rx="4" fill="#fbbf24" />
          <rect x="43" y="24" width="10" height="6" rx="2" fill="#f59e0b" />
          <rect x="30" y="50" width="36" height="3" rx="1.5" fill="#fde68a" />
          <rect x="30" y="58" width="28" height="3" rx="1.5" fill="#fde68a" />
          <rect x="30" y="66" width="32" height="3" rx="1.5" fill="#fde68a" />
          <circle cx="62" cy="78" r="10" fill="#22c55e" />
          <path d="M57 78l3.5 3.5 7-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="70" y="36" width="8" height="28" rx="2" fill="#f59e0b" transform="rotate(30 70 36)" />
          <polygon points="70,58 74,64 66,62" fill="#fbbf24" transform="rotate(30 70 36)" />
          <rect x="70" y="34" width="8" height="4" rx="1" fill="#d97706" transform="rotate(30 70 36)" />
        </svg>
      ),
    },
    {
      id: 3, title: "Learn & Build",
      desc: "Work on real-world projects guided by mentors. Submit weekly tasks, attend live sessions, and grow your skills.",
      color: "#ecfdf5", accent: "#10b981",
      icon: (
        <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" width="110" height="110">
          <circle cx="55" cy="55" r="52" fill="#a7f3d0" />
          <rect x="20" y="72" width="50" height="12" rx="3" fill="#3b82f6" />
          <rect x="23" y="60" width="46" height="12" rx="3" fill="#8b5cf6" />
          <rect x="26" y="48" width="42" height="12" rx="3" fill="#f59e0b" />
          <rect x="20" y="72" width="6" height="12" rx="1" fill="#2563eb" />
          <rect x="23" y="60" width="6" height="12" rx="1" fill="#7c3aed" />
          <rect x="26" y="48" width="6" height="12" rx="1" fill="#d97706" />
          <ellipse cx="67" cy="36" rx="18" ry="5" fill="#1e293b" />
          <rect x="63" y="32" width="8" height="10" rx="1" fill="#1e293b" />
          <polygon points="49,36 67,28 85,36 67,44" fill="#334155" />
          <line x1="85" y1="36" x2="85" y2="50" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="85" cy="52" r="4" fill="#f59e0b" />
          <polygon points="30,28 32,24 34,28 38,28 35,31 36,35 32,32 28,35 29,31 26,28" fill="#fbbf24" opacity="0.9" />
          <polygon points="80,68 81.5,65 83,68 86,68 84,70 84.5,73 81.5,71 78.5,73 79,70 77,68" fill="#fbbf24" opacity="0.7" />
        </svg>
      ),
    },
    {
      id: 4, title: "Get Certified",
      desc: "Complete your internship, pass the final assessment, and receive a verified digital certificate to share on LinkedIn.",
      color: "#f5f3ff", accent: "#8b5cf6",
      icon: (
        <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" width="110" height="110">
          <circle cx="55" cy="55" r="52" fill="#ddd6fe" />
          <rect x="18" y="28" width="64" height="54" rx="6" fill="white" />
          <rect x="18" y="28" width="64" height="10" rx="6" fill="#8b5cf6" />
          <rect x="18" y="34" width="64" height="4" fill="#8b5cf6" />
          <rect x="28" y="48" width="44" height="3" rx="1.5" fill="#ede9fe" />
          <rect x="32" y="55" width="36" height="3" rx="1.5" fill="#ede9fe" />
          <rect x="36" y="62" width="28" height="3" rx="1.5" fill="#ede9fe" />
          <circle cx="55" cy="76" r="12" fill="#fbbf24" />
          <circle cx="55" cy="76" r="9" fill="#f59e0b" />
          <path d="M55 68l1.8 5.5h5.8l-4.7 3.4 1.8 5.5-4.7-3.4-4.7 3.4 1.8-5.5-4.7-3.4h5.8z" fill="#fef3c7" />
          <path d="M46 86 l9 8 9-8" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="28" cy="36" r="3" fill="white" opacity="0.7" />
        </svg>
      ),
    },
  ];

  return (
    <section className="hiw-section">
      <div className="hiw-header">
        <h2 className="hiw-title">How it works</h2>
        <p className="hiw-sub">Keep calm &amp; intern on</p>
      </div>
      <div className="hiw-steps">
        {steps.map((step, i) => (
          <div key={step.id} className="hiw-step">
            {i < steps.length - 1 && (
              <div className="hiw-connector">
                <svg viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <path d="M0 12 Q30 3 60 12 Q90 21 120 12" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="7 5" fill="none" />
                </svg>
              </div>
            )}
            <div className="hiw-circle" style={{ background: step.color, boxShadow: `0 12px 40px ${step.accent}28` }}>
              {step.icon}
            </div>
            <div className="hiw-badge" style={{ background: step.accent }}>{step.id}</div>
            <div className="hiw-step-title">{step.title}</div>
            <div className="hiw-step-desc">{step.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Featured Internships Slider — fetches from Sanity ─────────────────────

const VISIBLE = 4;

function SliderCard({ item, idx }: { item: SanityInternship; idx: number }) {
  const [saved, setSaved] = useState(false);
  const detailHref = `/internships/${item.slug || item._id}`;
  const tierLabel = item.price === 0 ? "Free" : `₹${item.price.toLocaleString()}`;
  const tierClass = item.tier === "Free" ? "tier-free" : item.tier === "Pro" ? "tier-pro" : "tier-elite";

  return (
    <div className="fis-card">
      {/* Image area */}
      <div className="fis-card-img">
        {item.imageUrl || item.image ? (
          <img
            src={item.imageUrl || urlFor(item.image).width(400).height(220).url()}
            alt={item.title}
            className="fis-card-photo"
          />
        ) : (
          <div className="fis-card-fallback" style={{ background: bgGradients[item.bgClass] ?? bgGradients["bg-violet"] }}>
            <span style={{ fontSize: 52 }}>{item.icon}</span>
          </div>
        )}
        <div className="fis-card-img-overlay" />
        <div className="fis-card-top-row">
          {item.hot   && <span className="fis-badge-hot">🔥 Hot</span>}
          {item.isNew && <span className="fis-badge-new">✨ New</span>}
          <button className={`fis-save ${saved ? "saved" : ""}`} onClick={() => setSaved(s => !s)} aria-label="Save">
            <HeartIcon />
          </button>
        </div>
        <div className="fis-card-mode">
          <span className={`mode-badge mode-${item.mode.toLowerCase().replace("-","")}`}>{item.mode}</span>
        </div>
      </div>

      {/* Body */}
      <div className="fis-card-body">
        <div className="fis-card-meta">{item.domain} · {item.duration}</div>
        <div className="fis-card-title">{item.title}</div>
        <div className="fis-card-skills">
          {item.skills?.slice(0, 3).map(s => <span key={s} className="fis-skill-pill">{s}</span>)}
        </div>
        <div className="fis-card-footer">
          <div className="fis-card-price-block">
            <span className={`fis-price ${item.price === 0 ? "fis-price-free" : ""}`}>{tierLabel}</span>
            <span className="fis-tier"> / {item.tier}</span>
            <div className="fis-rating">
              <StarIcon /> {item.rating}
              <span className="fis-reviews">({item.reviews})</span>
            </div>
          </div>
          <Link href={detailHref} className="fis-details-btn">
            Details →
          </Link>
        </div>
        <div className="fis-card-seats">🪑 {item.seats} seats left · Starts {item.startDate}</div>
      </div>
    </div>
  );
}

function FeaturedInternshipsSlider() {
  const [items, setItems] = useState<SanityInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    client.fetch<SanityInternship[]>(SLIDER_QUERY)
      .then(res => { setItems(res?.length > 0 ? res : FALLBACK_SLIDER); setLoading(false); })
      .catch(() => { setItems(FALLBACK_SLIDER); setLoading(false); });
  }, []);

  const total = items.length;
  const maxIndex = Math.max(0, total - VISIBLE);

  const go = (dir: "prev" | "next") => {
    if (dir === "prev" && index === 0) return;
    if (dir === "next" && index >= maxIndex) return;
    setAnimDir(dir === "next" ? "left" : "right");
    setTimeout(() => {
      setIndex(i => dir === "next" ? i + 1 : i - 1);
      setAnimDir(null);
    }, 280);
  };

  const visible = items.slice(index, index + VISIBLE);

  return (
    <section className="fis-section" style={{ paddingTop: 0 }}>
      {/* Header */}
      <div className="fis-header">
        <div>
          <div className="fis-eyebrow">Handpicked for you</div>
          <div className="section-title">Featured internships</div>
          <div className="section-sub">Top rated · Verified certificates · Real projects</div>
        </div>
        <div className="fis-controls">
          <Link href="/internships" className="see-all" style={{ marginRight: 16 }}>View all →</Link>
          <button className={`fis-arrow ${index === 0 ? "fis-arrow-disabled" : ""}`} onClick={() => go("prev")} aria-label="Previous">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button className={`fis-arrow ${index >= maxIndex ? "fis-arrow-disabled" : ""}`} onClick={() => go("next")} aria-label="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      {/* Slider */}
      {loading ? (
        <div className="fis-skeleton-row">
          {Array.from({ length: VISIBLE }).map((_, i) => (
            <div key={i} className="fis-skeleton">
              <div className="fis-skeleton-img skeleton-pulse" />
              <div className="fis-skeleton-body">
                <div className="fis-skeleton-line skeleton-pulse" style={{ width: "60%", height: 10 }} />
                <div className="fis-skeleton-line skeleton-pulse" style={{ width: "90%", height: 14 }} />
                <div className="fis-skeleton-line skeleton-pulse" style={{ width: "40%", height: 12, marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="fis-track-wrap">
          <div className={`fis-track ${animDir ? `fis-slide-${animDir}` : ""}`}>
            {visible.map((item, i) => (
              <SliderCard key={item._id + index} item={item} idx={i} />
            ))}
          </div>
        </div>
      )}

      {/* Dots */}
      {!loading && maxIndex > 0 && (
        <div className="fis-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={`fis-dot ${i === index ? "fis-dot-active" : ""}`}
              onClick={() => {
                setAnimDir(i > index ? "left" : "right");
                setTimeout(() => { setIndex(i); setAnimDir(null); }, 280);
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Community() {
  return (
    <section>
      <div className="section-header">
        <div>
          <div className="section-title">Meet our mentors</div>
          <div className="section-sub">Real professionals · Available for 1:1 sessions</div>
        </div>
        <span className="see-all">See all →</span>
      </div>
      <div className="community-grid">
        {mentors.map((m) => (
          <div key={m.name} className="community-card">
            <div className={`community-card-img ${m.imgClass}`}>
              <span style={{ fontSize: 32 }}>{m.emoji}</span>
              {m.available && <div className="community-available-dot" />}
            </div>
            <div className="community-card-name">{m.name}</div>
            <div className="community-card-role">{m.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef   = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    const canvas = canvasRef.current;
    const glow   = glowRef.current;
    if (!footer || !canvas || !glow) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ── resize ── */
    function resize() {
      canvas!.width  = footer!.offsetWidth;
      canvas!.height = footer!.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(footer);

    /* ── mouse glow ── */
    const onMove = (e: MouseEvent) => {
      const rect = footer!.getBoundingClientRect();
      glow!.style.left = `${e.clientX - rect.left}px`;
      glow!.style.top  = `${e.clientY - rect.top}px`;
    };
    footer.addEventListener("mousemove", onMove);

    /* ── particles ── */
    const COLORS = ["#6366f1","#818cf8","#38bdf8","#a78bfa","#ffffff"];
    const COUNT  = 80;
    const MAX_DIST = 120;

    const particles = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * canvas!.width,
      y:  Math.random() * canvas!.height,
      r:  Math.random() * 1.4 + 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.45 + 0.1,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      ps: Math.random() * 0.02 + 0.005,
      po: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    let raf: number;

    function draw() {
      raf = requestAnimationFrame(draw);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      frame++;

      /* lines */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(99,102,241,${(1 - dist / MAX_DIST) * 0.12})`;
            ctx!.lineWidth = 0.8;
            ctx!.stroke();
          }
        }
      }

      /* dots */
      particles.forEach(p => {
        const pulse = Math.sin(frame * p.ps + p.po);
        const a = Math.max(0, Math.min(1, p.alpha + pulse * 0.15));
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r + pulse * 0.4, 0, Math.PI * 2);
        ctx!.fillStyle = p.color + Math.round(a * 255).toString(16).padStart(2, "0");
        ctx!.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = canvas!.width + 10;
        if (p.x > canvas!.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas!.height + 10;
        if (p.y > canvas!.height + 10) p.y = -10;
      });
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      footer.removeEventListener("mousemove", onMove);
    };
  }, []);

  const columns = [
    { title:"Solutions", links:["Internships","Certificates","Projects","Reports","Mentorship"] },
    { title:"Support",   links:["Getting started","Help center","Documentation","Guides","Status"] },
    { title:"Company",   links:["About","Blog","Jobs","Press","Partners"] },
    { title:"Legal",     links:["Terms of service","Privacy policy","Cookie policy","Licenses","Imprint"] },
  ];

  const socials = [
    /* Twitter/X */
    <svg key="x" viewBox="0 0 24 24" fill="white" width={16} height={16}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>,
    /* LinkedIn */
    <svg key="li" viewBox="0 0 24 24" fill="white" width={16} height={16}><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2" fill="white"/></svg>,
    /* Instagram */
    <svg key="ig" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" width={16} height={16}><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/></svg>,
    /* GitHub */
    <svg key="gh" viewBox="0 0 24 24" fill="white" width={16} height={16}><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>,
  ];

  return (
    <footer ref={footerRef}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} id="footer-canvas" />
      {/* Mouse glow */}
      <div ref={glowRef} className="footer-glow" />

      <div className="footer-top">
        <div>
          <div className="footer-brand">
            <img src="/logos/logo-dark.png" alt="Web3 Infomatics Solutions" className="footer-logo-img" />
          </div>
          <div className="footer-socials">
            {socials.map((icon, i) => (
              <div key={i} className="footer-social">{icon}</div>
            ))}
          </div>
        </div>
        {columns.map(col => (
          <div key={col.title}>
            <div className="footer-col-title">{col.title}</div>
            <div className="footer-links">
              {col.links.map(link => <div key={link} className="footer-link">{link}</div>)}
            </div>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">© 2026 Web3 Infomatics Solutions, Inc. All rights reserved.</div>
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Page() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };

  return (
    <>
      <Nav isDark={isDark} onToggle={toggleTheme} />
      <Hero />
      <FeaturedTracks />
      <HowItWorks />
      <FeaturedInternshipsSlider />
      <TestimonialsSection />
      <CertificateSection />
      <PartnersSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </>
  );
}