import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { BLAST_ZONES } from '../../constants/blastZones'
import { calcCasualties, calcFalloutArea, calcMaxRadius, calcDamage } from '../../lib/physics'
import { fmtN, fmtArea, fmtYield } from '../../lib/format'

const MONO = 'Share Tech Mono, monospace'

function line(text, delay, style = {}, dur = 1.2) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: dur, delay, ease: 'easeOut' }}
      style={{ fontFamily: MONO, ...style }}
    >
      {text}
    </motion.div>
  )
}

export function DetonationScreen({ selected, city, onClose }) {
  const contentRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(onClose, 30000)
    return () => clearTimeout(t)
  }, [onClose])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const proxy = { st: 0 }
    const tween = gsap.to(proxy, {
      st: 1,
      duration: 16.0,
      delay: 6.0,
      ease: 'power1.inOut',
      onUpdate() {
        if (el) el.scrollTop = proxy.st * Math.max(0, el.scrollHeight - el.clientHeight)
      },
    })
    return () => tween.kill()
  }, [])

  if (!selected) return null

  const cas = calcCasualties(selected.yield_kt, city)
  const fallout = calcFalloutArea(selected.yield_kt, selected.test_type)
  const damage = calcDamage(selected.yield_kt, city)
  const yieldStr = fmtYield(selected.yield_kt)
  const blastKm = (calcMaxRadius(selected.yield_kt) / 1000).toFixed(1)
  const heavyKm = ((calcMaxRadius(selected.yield_kt) / 1000) * BLAST_ZONES[1].fraction).toFixed(1)
  const hiroshimas = Math.max(1, Math.round((selected.yield_kt || 1) / 15))

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', overflow: 'hidden',
      }}
    >
      {/* White burst flash */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 0.15, 1, 0, 0] }}
        transition={{ duration: 3.2, times: [0, 0.1, 0.2, 0.6, 1], ease: 'easeOut' }}
        style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 10, pointerEvents: 'none' }}
      />
      {/* Fireball glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0.55, 0] }}
        transition={{ duration: 4.5, delay: 0.5, times: [0, 0.12, 0.55, 1], ease: 'easeOut' }}
        style={{
          position: 'absolute', inset: 0, zIndex: 9, pointerEvents: 'none',
          background: 'radial-gradient(circle at 50% 50%, rgba(255,200,60,0.95) 0%, rgba(255,80,0,0.7) 25%, rgba(180,20,0,0.4) 55%, transparent 80%)',
        }}
      />
      {/* Heat haze */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.2, 0] }}
        transition={{ duration: 2.4, delay: 0.8, times: [0, 0.4, 1] }}
        style={{ position: 'absolute', inset: 0, zIndex: 8, pointerEvents: 'none', backdropFilter: 'blur(6px)' }}
      />
      {/* Settle to dark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.2, delay: 2.8, ease: 'easeIn' }}
        style={{ position: 'absolute', inset: 0, background: '#030200', zIndex: 7, pointerEvents: 'none' }}
      />

      {/* Content */}
      <div
        ref={contentRef}
        style={{
          position: 'relative', zIndex: 11, width: '100%', maxWidth: 820,
          maxHeight: '100vh', overflowY: 'auto', scrollbarWidth: 'none',
          padding: 'clamp(16px,3vh,40px) clamp(24px,5vw,72px)',
          textAlign: 'center', display: 'flex', flexDirection: 'column',
          gap: 'clamp(8px, 1.4vh, 18px)',
        }}
      >
        {line('☢', 3.0, { fontSize: 'clamp(1.6rem,3.5vw,2.8rem)', color: '#cc0000', letterSpacing: '0.1em' }, 1.4)}
        {line(selected.name.toUpperCase(), 3.8, { fontSize: 'clamp(2rem, 5vw, 4.5rem)', color: '#f0cc00', letterSpacing: '0.06em', lineHeight: 1, textShadow: '0 0 40px rgba(240,204,0,0.35)' }, 1.8)}
        {line(`OVER ${city.name.toUpperCase()}`, 5.2, { fontSize: 'clamp(1.2rem, 3vw, 2.6rem)', color: '#ff4800', letterSpacing: '0.12em', lineHeight: 1, textShadow: '0 0 24px rgba(255,72,0,0.45)' }, 1.6)}
        {line(`${selected.country.toUpperCase()}  ·  ${selected.year}  ·  ${yieldStr}`, 6.4, { fontSize: 'clamp(0.65rem, 1.1vw, 0.9rem)', color: '#8a7c00', letterSpacing: '0.25em' })}
        {line('─'.repeat(48), 7.4, { color: '#2a2200', fontSize: '0.6rem', letterSpacing: '0.05em' }, 1.0)}
        {line(`${fmtN(cas.deaths)} KILLED IN ${city.name.toUpperCase()}`, 8.2, { fontSize: 'clamp(1.8rem, 4.5vw, 3.8rem)', color: '#cc0000', letterSpacing: '0.04em', lineHeight: 1, textShadow: '0 0 30px rgba(200,0,0,0.4)' }, 2.0)}
        {line(`IN THE FIRST HOUR ALONE.  ${fmtN(cas.injuries)} MORE LEFT INJURED.`, 10.0, { fontSize: 'clamp(0.72rem, 1.3vw, 1.05rem)', color: '#c9a800', letterSpacing: '0.14em', lineHeight: 1.5 }, 1.4)}
        {line(`EVERY HOSPITAL WITHIN ${heavyKm} KM IS GONE.`, 11.6, { fontSize: 'clamp(0.7rem, 1.2vw, 1rem)', color: '#c86020', letterSpacing: '0.13em' }, 1.4)}
        {line('THE FIREBALL REACHES 10,000°C — HOTTER THAN THE SURFACE OF THE SUN.', 13.0, { fontSize: 'clamp(0.68rem, 1.1vw, 0.9rem)', color: '#a09200', letterSpacing: '0.11em' }, 1.3)}
        {line(`FALLOUT CONTAMINATES ${fmtArea(fallout)} OF ${city.name.toUpperCase()}'S SURROUNDINGS.`, 14.4, { fontSize: 'clamp(0.68rem, 1.1vw, 0.9rem)', color: '#a09200', letterSpacing: '0.11em' }, 1.3)}
        {line(`ECONOMIC LOSS: ${damage}.  EQUIVALENT TO ${hiroshimas} HIROSHIMA BOMBS.`, 15.8, { fontSize: 'clamp(0.68rem, 1.1vw, 0.9rem)', color: '#8a7c00', letterSpacing: '0.11em' }, 1.3)}
        {line('─'.repeat(48), 17.2, { color: '#2a2200', fontSize: '0.6rem', letterSpacing: '0.05em' }, 1.0)}
        {line('THIS WEAPON WAS REAL.  THIS TEST HAPPENED.', 18.0, { fontSize: 'clamp(0.85rem, 1.5vw, 1.2rem)', color: '#c9a800', letterSpacing: '0.2em', textShadow: '0 0 12px rgba(201,168,0,0.25)' }, 1.6)}
        {line('CLICK ANYWHERE TO CONTINUE', 20.5, { fontSize: 'clamp(0.52rem, 0.85vw, 0.68rem)', color: '#a09200', letterSpacing: '0.3em' }, 1.2)}
      </div>

      {/* Auto fade-out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, delay: 27.0, ease: 'easeIn' }}
        style={{ position: 'absolute', inset: 0, background: '#000', zIndex: 12, pointerEvents: 'none' }}
      />
    </motion.div>
  )
}
