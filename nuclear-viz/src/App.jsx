import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Landing } from './components/Landing'
import { Globe } from './components/Globe'
import { BlastMap } from './components/BlastMap'
import detonationsRaw from './data/nuclear-detonations.json'

const detonations = [...detonationsRaw].sort(
  (a, b) => a.year - b.year || a.name.localeCompare(b.name)
)

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function App() {
  const [selected, setSelected] = useState(null)
  const containerRef = useRef(null)

  const handleSelect = (det) => {
    setSelected((prev) => (prev?.name === det.name ? null : det))
  }

  // Block manual scroll — navigation only via buttons
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const block = (e) => e.preventDefault()
    el.addEventListener('wheel', block, { passive: false })
    el.addEventListener('touchmove', block, { passive: false })
    return () => {
      el.removeEventListener('wheel', block)
      el.removeEventListener('touchmove', block)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="font-mono"
      style={{
        height: '100dvh',
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        background: 'var(--color-bg)',
        color: 'var(--color-primary)',
      }}
    >
      {/* SECTION 1: Boot sequence / Landing */}
      <div style={{ scrollSnapAlign: 'start', height: '100dvh' }}>
        <Landing onEnter={() => scrollTo('dashboard')} />
      </div>

      {/* SECTION 2: Main dashboard */}
      <section
        id="dashboard"
        className="relative"
        style={{
          scrollSnapAlign: 'start',
          borderTop: '1px solid rgba(201,168,0,0.25)',
          height: '100dvh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Slim nav bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          style={{
            flexShrink: 0,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(201,168,0,0.12)',
            background: 'rgba(7,6,0,0.7)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <motion.button
            onClick={() => scrollTo('landing')}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            style={{
              background: 'none',
              border: 'none',
              color: '#8a7c00',
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '0.60rem',
              letterSpacing: '0.22em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '4px 16px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#c9a800'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#8a7c00'
            }}
          >
            <motion.span
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            >
              ▲
            </motion.span>
            RETURN TO TERMINAL
            <motion.span
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            >
              ▲
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Full-height split: Globe | Impact */}
        <div
          className="dashboard-split flex flex-col md:flex-row flex-1"
          style={{ minHeight: 0, minWidth: 0 }}
        >
          <div
            className="globe-half flex-1 terminal-panel"
            style={{
              borderRight: '1px solid rgba(201,168,0,0.15)',
              minHeight: 0,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <Globe
              detonations={detonations}
              selected={selected}
              onSelect={handleSelect}
              onReturn={() => scrollTo('landing')}
            />
          </div>
          <div
            className="impact-half flex-1 terminal-panel"
            style={{ minHeight: 0, minWidth: 0, overflow: 'hidden' }}
          >
            <BlastMap selected={selected} />
          </div>
        </div>
      </section>
    </div>
  )
}
