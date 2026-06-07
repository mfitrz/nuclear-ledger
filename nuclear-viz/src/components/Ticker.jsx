import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { COUNTRY_COLORS, COUNTRY_ABBR } from '../constants/countries'

export function WeaponTicker({ detonations, selected, onSelect }) {
  const innerRef = useRef(null)
  const tweenRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const inner = innerRef.current
    const container = containerRef.current
    if (!inner || !container) return

    const totalWidth = inner.scrollWidth / 2
    if (totalWidth <= 0) return

    if (tweenRef.current) tweenRef.current.kill()

    tweenRef.current = gsap.to(inner, {
      x: -totalWidth,
      duration: detonations.length * 3.5,
      repeat: -1,
      ease: 'none',
    })

    return () => {
      if (tweenRef.current) tweenRef.current.kill()
    }
  }, [detonations])

  const renderItems = () =>
    detonations.map((det, i) => {
      const color = COUNTRY_COLORS[det.country] || '#8a7c00'
      const abbr = COUNTRY_ABBR[det.country] || det.country
      const isSelected = selected?.name === det.name

      return (
        <button
          key={`${det.name}-${i}`}
          onClick={() => onSelect(det)}
          className="flex-shrink-0 flex items-center gap-2 px-3 py-1 border-r cursor-pointer transition-all group"
          style={{
            borderColor: 'rgba(201,168,0,0.15)',
            background: isSelected ? 'rgba(201,168,0,0.1)' : 'transparent',
          }}
          tabIndex={0}
          aria-label={`Select ${det.name}`}
        >
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: color, boxShadow: isSelected ? `0 0 6px ${color}` : 'none' }}
          />
          <span
            className="text-xs font-mono tracking-widest whitespace-nowrap group-hover:text-terminal-bright transition-colors"
            style={{
              color: isSelected ? '#f0cc00' : 'var(--color-primary)',
              textShadow: isSelected ? '0 0 8px rgba(240,204,0,0.4)' : 'none',
            }}
          >
            {det.name.toUpperCase()}
          </span>
          <span className="text-xs font-mono tracking-widest text-terminal-dim whitespace-nowrap">
            {det.year}
          </span>
          <span className="text-xs font-mono tracking-widest whitespace-nowrap" style={{ color }}>
            {det.yield_kt >= 1000
              ? `${(det.yield_kt / 1000).toFixed(det.yield_kt >= 10000 ? 0 : 1)}MT`
              : `${det.yield_kt}KT`}
          </span>
          <span className="text-terminal-dimmer text-xs tracking-widest whitespace-nowrap">{abbr}</span>
        </button>
      )
    })

  return (
    <div
      ref={containerRef}
      className="sticky bottom-0 z-40 w-full overflow-hidden border-t"
      style={{
        background: 'rgba(10,9,0,0.97)',
        backdropFilter: 'blur(4px)',
        borderColor: 'rgba(201,168,0,0.25)',
        boxShadow: '0 -2px 20px rgba(201,168,0,0.06)',
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-3 border-r"
        style={{ borderColor: 'rgba(201,168,0,0.25)', background: 'rgba(10,9,0,0.98)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-primary)' }} />
          <span className="text-terminal-dim text-xs tracking-widest whitespace-nowrap">ARCHIVE</span>
        </div>
      </div>

      <div className="flex items-stretch h-9 ml-24">
        <div ref={innerRef} className="ticker-inner flex items-stretch" style={{ willChange: 'transform' }}>
          {renderItems()}
          {renderItems()}
        </div>
      </div>
    </div>
  )
}
