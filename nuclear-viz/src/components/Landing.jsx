import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

const CHAR_S = 0.009 // seconds per character
const GAP_S = 0.06 // pause between lines

const BOOT_LINES_RAW = [
  'INITIALIZING SECURE TERMINAL...',
  'ENCRYPTION PROTOCOL: AES-256 // ACTIVE',
  'LOADING DETONATION ARCHIVE: 1945–2017',
  'RECORDS FOUND: 101 EVENTS ACROSS 9 NATIONS',
  'TOTAL CUMULATIVE YIELD: 170,842 KILOTONS',
  'EQUIVALENT: 11,389 HIROSHIMA-CLASS DEVICES',
  '──────────────────────────────────────────',
  'GEOSPATIAL INDEX: LOADED',
  'ATMOSPHERIC SIMULATION ENGINE: ONLINE',
  'IMPACT VISUALIZATION: STANDBY',
  '──────────────────────────────────────────',
  'WARNING: DATA REPRESENTS ACTUAL DETONATION EVENTS',
  '──────────────────────────────────────────',
  'TERMINAL READY // AWAITING OPERATOR INPUT',
  '──────────────────────────────────────────',
  'PRESS THE BUTTON BELOW TO ENTER SIMULATION',
]

// Each line starts after the previous one finishes typing
const BOOT_LINES = (() => {
  let t = 0.25
  return BOOT_LINES_RAW.map((text) => {
    const delay = t
    t += text.length * CHAR_S + GAP_S
    return { text, delay }
  })
})()

function TypeLine({ text, isLast }) {
  const [displayed, setDisplayed] = useState('')
  const idx = useRef(0)
  useEffect(() => {
    idx.current = 0
    setDisplayed('')
    const iv = setInterval(() => {
      idx.current++
      setDisplayed(text.slice(0, idx.current))
      if (idx.current >= text.length) clearInterval(iv)
    }, CHAR_S * 1000)
    return () => clearInterval(iv)
  }, [text])
  return (
    <span>
      {displayed}
      {isLast && displayed === text && (
        <span style={{ animation: 'blink 1s step-end infinite' }}>█</span>
      )}
    </span>
  )
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: 'easeOut' },
})

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, delay, ease: 'easeOut' },
})

export function Landing({ onEnter }) {
  const linesRef = useRef([])
  const titleRef = useRef(null)
  const [visibleLines, setVisibleLines] = useState([])
  useEffect(() => {
    const timers = BOOT_LINES.map((line, i) =>
      setTimeout(() => setVisibleLines((prev) => [...prev, i]), line.delay * 1000)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const el = linesRef.current[visibleLines.length - 1]
    if (el)
      gsap.fromTo(
        el,
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.16, ease: 'power2.out' }
      )
  }, [visibleLines])

  // GSAP title blur-reveal
  useEffect(() => {
    if (!titleRef.current) return
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, filter: 'blur(18px) brightness(3)' },
      {
        opacity: 1,
        filter: 'blur(0px) brightness(1)',
        duration: 1.3,
        ease: 'power2.out',
        delay: 0.05,
      }
    )
  }, [])

  const getLineStyle = (text) => {
    if (text.startsWith('─')) return { color: '#2a2600' }
    if (text.includes('WARNING'))
      return { color: '#c83030', textShadow: '0 0 6px rgba(200,48,0,0.35)' }
    if (text.includes('TOTAL') || text.includes('EQUIVALENT'))
      return { color: '#f0cc00', textShadow: '0 0 5px rgba(240,204,0,0.25)' }
    if (text.includes('PRESS THE BUTTON'))
      return {
        color: '#c9a800',
        animation: 'blink 2.4s ease-in-out infinite',
        letterSpacing: '0.18em',
      }
    if (
      text.includes('READY') ||
      text.includes('ONLINE') ||
      text.includes('LOADED') ||
      text.includes('ACTIVE')
    )
      return { color: '#c9a800' }
    return { color: '#a09200' }
  }

  const hPad = 'clamp(24px, 4.5vw, 72px)'

  return (
    <section
      id="landing"
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--color-bg)',
      }}
    >
      {/* Dot grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: 'radial-gradient(circle, rgba(201,168,0,0.04) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />

      {/* ── MAIN CONTENT — 50/50 split on desktop, stacked on mobile ── */}
      <div
        className="flex flex-col md:flex-row"
        style={{ flex: 1, minHeight: 0, position: 'relative', zIndex: 1, overflowY: 'auto' }}
      >
        {/* ── LEFT: badge + giant title + subtitle ── */}
        <div
          className="md:border-r"
          style={{
            flex: '0 0 50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: `clamp(24px,4vh,56px) clamp(16px,2.5vw,40px)`,
            borderColor: 'rgba(201,168,0,0.08)',
            textAlign: 'center',
          }}
        >
          {/* Giant title */}
          <div ref={titleRef} style={{ opacity: 0, marginBottom: 'clamp(16px,2.2vh,28px)' }}>
            <div
              style={{
                fontSize: 'clamp(4.8rem, 9vw, 12rem)',
                letterSpacing: '0.02em',
                lineHeight: 0.88,
                color: '#f0cc00',
                textShadow: '0 0 60px rgba(240,204,0,0.20), 0 0 120px rgba(240,204,0,0.07)',
                fontFamily: 'Share Tech Mono, monospace',
                fontWeight: 'normal',
              }}
            >
              NUCLEAR
              <br />
              LEDGER
            </div>
          </div>

          {/* Subtitles */}
          <motion.div
            {...fadeUp(0.35)}
            style={{
              marginBottom: 6,
              fontSize: 'clamp(0.7rem, 1.1vw, 1.1rem)',
              letterSpacing: '0.22em',
              color: '#8a7c00',
            }}
          >
            STRATEGIC ANALYSIS SYSTEM v4.2
          </motion.div>
          <motion.div
            {...fadeUp(0.45)}
            style={{
              fontSize: 'clamp(0.62rem, 0.9vw, 0.9rem)',
              letterSpacing: '0.18em',
              color: '#8a7c00',
            }}
          >
            ARCHIVE: 1945 — 2017 &nbsp;·&nbsp; 72 YEARS
          </motion.div>
        </div>

        {/* ── RIGHT: terminal lines + CTA ── */}
        <div
          className="border-t md:border-t-0"
          style={{
            flex: '0 0 50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: `clamp(16px,4vh,56px) ${hPad} clamp(16px,4vh,56px) clamp(16px,2.5vw,40px)`,
            gap: 'clamp(14px,2.2vh,24px)',
            borderColor: 'rgba(201,168,0,0.08)',
          }}
        >
          {/* Boot lines — each slot pre-allocated with flex:1 to prevent layout shift */}
          <motion.div {...fadeIn(0.55)} style={{ flex: 1, minHeight: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {BOOT_LINES.map((line, i) => (
                <div
                  key={i}
                  ref={(el) => (linesRef.current[i] = el)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: 'Share Tech Mono, monospace',
                    fontSize: 'clamp(0.9rem, 1.35vw, 1.4rem)',
                    letterSpacing: '0.07em',
                    lineHeight: 1,
                    opacity: visibleLines.includes(i) ? 1 : 0,
                    ...getLineStyle(line.text),
                  }}
                >
                  {visibleLines.includes(i) && (
                    <TypeLine text={line.text} isLast={i === BOOT_LINES.length - 1} />
                  )}
                  {!visibleLines.includes(i) && <span style={{ userSelect: 'none' }}>&nbsp;</span>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── ENTER NAV BAR — mirrors RETURN_TO_SURFACE ── */}
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
          borderTop: '1px solid rgba(201,168,0,0.12)',
          background: 'rgba(7,6,0,0.7)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <motion.button
          onClick={onEnter}
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
            animate={{ y: [0, 2, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          >
            ▼
          </motion.span>
          ENTER SIMULATION
          <motion.span
            animate={{ y: [0, 2, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          >
            ▼
          </motion.span>
        </motion.button>
      </motion.div>
    </section>
  )
}
