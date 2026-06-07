import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { getColor } from '../../constants/countries'
import {
  PANEL_BG, PANEL_BORDER, PANEL_BLUR, PANEL_SHADOW, PANEL_MAX_W, PANEL_MIN_W,
  FS_VALUE, FS_META,
} from './panelStyles'

export function DetonationPicker({ group, onSelect, onClose, selected }) {
  const desktopScrollRef = useRef(null)
  const mobileScrollRef = useRef(null)

  // Desktop: stop wheel propagation; at boundary also preventDefault so the snap container doesn't scroll
  useEffect(() => {
    const el = desktopScrollRef.current
    if (!el) return
    const stop = (e) => {
      e.stopPropagation()
      const { scrollTop, scrollHeight, clientHeight } = el
      const atTop = scrollTop <= 0
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1
      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) e.preventDefault()
    }
    el.addEventListener('wheel', stop, { passive: false })
    return () => el.removeEventListener('wheel', stop)
  }, [group])

  // Mobile: stop touchmove propagation; at boundary also preventDefault
  useEffect(() => {
    const el = mobileScrollRef.current
    if (!el) return
    let lastY = null
    const stop = (e) => {
      e.stopPropagation()
      if (e.touches.length !== 1) return
      const y = e.touches[0].clientY
      if (lastY !== null) {
        const dy = lastY - y
        const { scrollTop, scrollHeight, clientHeight } = el
        const atTop = scrollTop <= 0
        const atBottom = scrollTop + clientHeight >= scrollHeight - 1
        if ((dy < 0 && atTop) || (dy > 0 && atBottom)) e.preventDefault()
      }
      lastY = y
    }
    const reset = () => { lastY = null }
    el.addEventListener('touchmove', stop, { passive: false })
    el.addEventListener('touchend', reset)
    return () => {
      el.removeEventListener('touchmove', stop)
      el.removeEventListener('touchend', reset)
    }
  }, [group])

  if (!group) return null

  const site = (group?.[0]?.site || 'UNKNOWN_SITE').toUpperCase()

  const renderItems = (mobilePad = false) =>
    group.map((det, idx) => {
      const isSel = selected?.name === det.name
      const color = getColor(det.country)
      const yieldLbl =
        det.yield_kt >= 1000
          ? `${(det.yield_kt / 1000).toFixed(1)}MT`
          : det.yield_kt
            ? `${det.yield_kt}KT`
            : '??'
      return (
        <motion.button
          key={det.name}
          onClick={() => { onSelect(det); onClose() }}
          whileHover={{ backgroundColor: 'rgba(201,168,0,0.07)' }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: mobilePad ? '13px 16px' : '8px 14px',
            background: isSel ? 'rgba(201,168,0,0.1)' : 'transparent',
            border: 'none', borderBottom: '1px solid rgba(201,168,0,0.07)',
            cursor: 'pointer', textAlign: 'left', fontFamily: 'Share Tech Mono, monospace',
          }}
        >
          <span style={{ fontSize: FS_META, color: '#8a7c00', flexShrink: 0, minWidth: '1.4em', textAlign: 'right' }}>
            {idx + 1}.
          </span>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{
            fontSize: mobilePad ? '0.72rem' : FS_VALUE,
            letterSpacing: '0.07em',
            color: isSel ? '#f0cc00' : '#c9a800',
            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {det.name.toUpperCase()}
          </span>
          <span style={{ fontSize: FS_META, color: '#8a7c00', flexShrink: 0 }}>{det.year}</span>
          <span style={{ fontSize: FS_META, color, flexShrink: 0, marginLeft: 6 }}>{yieldLbl}</span>
        </motion.button>
      )
    })

  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'all', cursor: 'default' }}
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Desktop: centered floating panel */}
      <motion.div
        className="hidden md:flex flex-col"
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{
          position: 'absolute', left: '50%', top: '50%', x: '-50%', y: '20px',
          background: PANEL_BG, border: PANEL_BORDER, backdropFilter: PANEL_BLUR,
          boxShadow: PANEL_SHADOW, maxWidth: PANEL_MAX_W, minWidth: PANEL_MIN_W,
          maxHeight: 300, overflow: 'hidden', cursor: 'default',
        }}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '10px 14px', borderBottom: '1px solid rgba(201,168,0,0.18)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.16em', color: '#f0cc00', fontFamily: 'Share Tech Mono, monospace' }}>
              SELECT DETONATION
            </div>
            <div style={{ fontSize: FS_META, letterSpacing: '0.1em', color: '#8a7c00', marginTop: 3, fontFamily: 'Share Tech Mono, monospace' }}>
              {site}&nbsp;//&nbsp;{group.length}&nbsp;EVENTS
            </div>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ color: '#f0cc00' }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'none', border: 'none', color: '#a09200', fontSize: '36px',
              cursor: 'pointer', padding: '0px 10px', lineHeight: 1,
              fontFamily: 'Share Tech Mono, monospace', flexShrink: 0, transition: 'color 0.15s',
            }}
          >
            ×
          </motion.button>
        </div>
        <div ref={desktopScrollRef} className="nk-picker-scroll" style={{ overflowY: 'auto', flex: 1 }}>
          {renderItems(false)}
        </div>
      </motion.div>

      {/* Mobile: fills entire globe panel */}
      <motion.div
        className="flex md:hidden flex-col"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{ position: 'absolute', inset: 0, background: PANEL_BG, cursor: 'default' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '14px 16px', borderBottom: '1px solid rgba(201,168,0,0.2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', letterSpacing: '0.16em', color: '#f0cc00', fontFamily: 'Share Tech Mono, monospace' }}>
              SELECT DETONATION
            </div>
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: '#8a7c00', marginTop: 4, fontFamily: 'Share Tech Mono, monospace' }}>
              {site}&nbsp;//&nbsp;{group.length}&nbsp;EVENTS
            </div>
          </div>
          <motion.button
            onClick={onClose}
            whileTap={{ scale: 0.88 }}
            style={{
              background: 'none', border: 'none', color: '#c9a800', fontSize: '44px',
              cursor: 'pointer', padding: '0 12px', lineHeight: 1,
              fontFamily: 'Share Tech Mono, monospace', flexShrink: 0,
            }}
          >
            ×
          </motion.button>
        </div>
        <div ref={mobileScrollRef} className="nk-mobile-scroll" style={{ overflowY: 'scroll', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          {renderItems(true)}
        </div>
      </motion.div>
    </div>
  )
}
