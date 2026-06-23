'use client'

/**
 * app/studio/[[...tool]]/page.tsx
 */

import dynamic from 'next/dynamic'
import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

const Studio = dynamic(
  () => Promise.resolve(() => <NextStudio config={config} />),
  {
    ssr: false,
    loading: () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#101010',
        color: '#fff',
        fontFamily: 'sans-serif',
        fontSize: 14,
      }}>
        Loading Studio…
      </div>
    ),
  }
)

export default function StudioPage() {
  return <Studio />
}