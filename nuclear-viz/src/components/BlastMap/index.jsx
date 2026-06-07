import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { CITIES } from '../../constants/cities'
import { BLAST_ZONES } from '../../constants/blastZones'
import { calcMaxRadius, calcCasualties } from '../../lib/physics'
import { fmtN, fmtArea } from '../../lib/format'
import { MapCapture } from './MapCapture'
import { MapResizer } from './MapResizer'
import { MapController } from './MapController'
import { PanTracker } from './PanTracker'
import { AnimatedBlastZones } from './AnimatedBlastZones'
import { DetonationScreen } from './DetonationScreen'
import { ImpactCard } from './ImpactCard'

export function BlastMap({ selected }) {
  const [city, setCity] = useState(CITIES[0])
  const [mapW, setMapW] = useState(400)
  const [phase, setPhase] = useState('idle')
  const [btnVisible, setBtnVisible] = useState(false)
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const savedZoomRef = useRef(13)
  const savedCenterRef = useRef(null)

  const center = [city.lat, city.lng]

  useEffect(() => {
    if (selected) {
      setPhase('ready')
      setBtnVisible(false)
      const map = mapInstanceRef.current
      if (map) {
        const cur = map.getCenter()
        const dist = Math.abs(cur.lat - center[0]) + Math.abs(cur.lng - center[1])
        if (dist < 0.01) {
          setBtnVisible(true)
        } else {
          map.flyTo(center, map.getZoom(), { duration: 1.1, easeLinearity: 0.4 })
        }
      } else {
        setBtnVisible(true)
      }
    } else {
      setPhase('idle')
      setBtnVisible(false)
    }
  }, [selected?.name, city.name]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePanEnd = useCallback(() => {
    setPhase((p) => {
      if (p === 'ready') setBtnVisible(true)
      return p
    })
  }, [])

  useEffect(() => {
    const el = mapContainerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setMapW(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleDetonate = useCallback(() => {
    const map = mapInstanceRef.current
    if (map) {
      savedZoomRef.current = map.getZoom()
      savedCenterRef.current = map.getCenter()
    }
    setBtnVisible(false)
    setPhase('detonating')
  }, [])

  const handleDetonationClose = useCallback(() => {
    const map = mapInstanceRef.current
    if (map && savedCenterRef.current) {
      map.setView(savedCenterRef.current, savedZoomRef.current, { animate: false })
    }
    setPhase('revealed')
  }, [])

  const maxRadius_m = calcMaxRadius(selected?.yield_kt)
  const isRevealed = phase === 'revealed'
  const isReady = phase === 'ready'

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(201,168,0,0.15)' }}
      >
        <div>
          <div className="text-terminal-bright text-xs tracking-widest font-mono">IMPACT VISUALIZATION</div>
          <div className="section-label mt-0.5 flex items-center gap-2">
            <span>TARGET</span>
            <select
              value={city.name}
              onChange={(e) => setCity(CITIES.find((c) => c.name === e.target.value))}
              style={{
                background: 'rgba(201,168,0,0.05)', border: '1px solid rgba(201,168,0,0.3)',
                color: 'var(--color-primary)', outline: 'none',
                fontFamily: 'Share Tech Mono, monospace', fontSize: '0.6rem',
                letterSpacing: '0.1em', padding: '2px 6px', cursor: 'grab', minWidth: 100,
              }}
            >
              {CITIES.map((c) => (
                <option key={c.name} value={c.name} style={{ background: '#0a0900' }}>
                  {c.name.toUpperCase()}
                </option>
              ))}
            </select>
            <span style={{ opacity: 0.4 }}>·</span>
            <span className="hidden md:inline">CLICK, HOLD AND DRAG TO PAN · SCROLL TO ZOOM</span>
            <span className="inline md:hidden">HOLD AND DRAG TO PAN· PINCH TO ZOOM · TAP TO SELECT</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div ref={mapContainerRef} className="flex-1 relative" style={{ minHeight: 0 }}>
        <MapContainer
          center={center}
          zoom={13}
          minZoom={5}
          maxBounds={[[-85, -Infinity], [85, Infinity]]}
          maxBoundsViscosity={0.8}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <MapCapture mapRef={mapInstanceRef} />
          <MapResizer containerRef={mapContainerRef} />
          <MapController center={center} />
          <PanTracker onMoveEnd={handlePanEnd} />
          {isRevealed && (
            <AnimatedBlastZones
              key={`${selected?.name}-${city.name}`}
              selected={selected}
              center={center}
              maxRadius_m={maxRadius_m}
            />
          )}
        </MapContainer>

        {/* Impact card — desktop only, shown after detonation */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              key="impact-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="hidden md:block"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 490 }}
            >
              <ImpactCard selected={selected} city={city} mapW={mapW} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile blast zone legend */}
        {isRevealed && (
          <div
            className="flex md:hidden flex-col"
            style={{
              position: 'absolute', top: 8, right: 8, zIndex: 490,
              background: 'rgba(7,6,0,0.88)', border: '1px solid rgba(201,168,0,0.2)',
              backdropFilter: 'blur(6px)', padding: '5px 8px', gap: 3, pointerEvents: 'none',
            }}
          >
            {BLAST_ZONES.map((z) => (
              <div key={z.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: z.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.48rem', letterSpacing: '0.08em', color: z.color, fontFamily: 'Share Tech Mono, monospace', whiteSpace: 'nowrap' }}>
                  {z.name
                    .replace('MODERATE BLAST', 'MOD BLAST')
                    .replace('THERMAL RADIATION', 'THERMAL')
                    .replace('HEAVY BLAST', 'HVY BLAST')
                    .replace('LIGHT BLAST', 'LGT BLAST')}
                </span>
                <span style={{ fontSize: '0.46rem', color: '#8a7c00', fontFamily: 'Share Tech Mono, monospace', whiteSpace: 'nowrap', marginLeft: 'auto', paddingLeft: 4 }}>
                  {((maxRadius_m * z.fraction) / 1000).toFixed(1)}km
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Zoom buttons — desktop only */}
        <div className="hidden md:flex" style={{ position: 'absolute', top: 12, left: 12, zIndex: 500, flexDirection: 'column', gap: 4 }}>
          {[
            { label: '+', fn: () => mapInstanceRef.current?.zoomIn() },
            { label: '−', fn: () => mapInstanceRef.current?.zoomOut() },
          ].map(({ label, fn }) => (
            <motion.button
              key={label}
              onClick={fn}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              style={{
                width: 32, height: 32, background: 'rgba(8,7,0,0.9)',
                border: '1px solid rgba(201,168,0,0.35)', color: '#c9a800',
                fontFamily: 'Share Tech Mono, monospace', fontSize: 20, lineHeight: 1,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                userSelect: 'none', flexShrink: 0,
              }}
            >
              {label}
            </motion.button>
          ))}
        </div>

        {/* Interaction lock while awaiting detonation */}
        {isReady && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 490, cursor: 'default' }} />
        )}

        {/* DETONATE button */}
        <AnimatePresence>
          {isReady && btnVisible && selected && (
            <motion.div
              key="detonate-btn"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                position: 'absolute', left: '50%', top: '50%',
                x: '-50%', y: '-50%', zIndex: 500,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
              }}
            >
              <div
                className="nk-selected-label"
                style={{
                  fontFamily: 'Share Tech Mono, monospace', fontSize: 'clamp(1.1rem, 5vw, 2.8rem)',
                  color: '#ff0000', letterSpacing: '0.12em', textAlign: 'center',
                  textShadow: '0 0 24px rgba(255,0,0,0.8), 0 0 48px rgba(255,0,0,0.4)', whiteSpace: 'nowrap',
                }}
              >
                ☢ TARGET: {city.name.toUpperCase()} ☢
              </div>

              <motion.button
                onClick={handleDetonate}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ boxShadow: ['0 0 16px rgba(200,48,0,0.3)', '0 0 40px rgba(200,48,0,0.65)', '0 0 16px rgba(200,48,0,0.3)'] }}
                transition={{ boxShadow: { repeat: Infinity, duration: 2.0, ease: 'easeInOut' } }}
                style={{
                  background: 'rgba(5,0,0,0.97)', border: '1px solid rgba(200,48,0,0.75)',
                  color: '#ff4800', fontFamily: 'Share Tech Mono, monospace',
                  fontSize: 'clamp(0.85rem, 3vw, 1.3rem)',
                  letterSpacing: 'clamp(0.12em, 1vw, 0.38em)',
                  padding: 'clamp(12px, 2.5vh, 22px) clamp(20px, 7vw, 72px)',
                  cursor: 'pointer', textShadow: '0 0 12px rgba(255,72,0,0.6)',
                  display: 'block', whiteSpace: 'nowrap',
                }}
              >
                DETONATE
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle hint */}
        {phase === 'idle' && (
          <div className="absolute pointer-events-none" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 400 }}>
            <div style={{
              background: 'rgba(7,6,0,0.88)', border: '1px solid rgba(201,168,0,0.30)',
              backdropFilter: 'blur(8px)', padding: '10px 20px',
              boxShadow: '0 0 24px rgba(201,168,0,0.08)',
              display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap',
            }}>
              <span style={{ color: '#c9a800', fontSize: '0.75rem' }}>☢</span>
              <span className="section-label" style={{ whiteSpace: 'nowrap', color: '#c9a800', fontSize: '0.62rem' }}>
                SELECT A DETONATION ON THE GLOBE
              </span>
              <span style={{ color: '#c9a800', fontSize: '0.75rem' }}>☢</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        className="border-t flex-shrink-0"
        style={{ borderColor: 'rgba(201,168,0,0.15)', height: 72, minHeight: 72, maxHeight: 72, overflow: 'hidden' }}
      >
        {/* Desktop */}
        <div
          className="hidden md:flex px-4 flex-wrap items-center gap-x-4 gap-y-1"
          style={{ height: '100%', paddingTop: 8, paddingBottom: 8 }}
        >
          {isRevealed ? (
            BLAST_ZONES.map((z) => (
              <div key={z.name} className="flex items-center gap-2">
                <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: z.color }} />
                <span style={{ fontSize: '0.68rem', letterSpacing: '0.09em', color: z.color }}>
                  {z.name}&nbsp;{((maxRadius_m * z.fraction) / 1000).toFixed(1)}KM
                </span>
              </div>
            ))
          ) : (
            <span style={{ fontSize: '0.68rem', letterSpacing: '0.18em', color: '#9a8c00' }}>
              {phase === 'idle'
                ? 'NO TARGET SELECTED'
                : phase === 'ready'
                  ? 'TARGET LOCKED — AWAITING DETONATION'
                  : 'DETONATING...'}
            </span>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden px-3 items-center" style={{ height: '100%' }}>
          {isRevealed && selected ? (
            (() => {
              const cas = calcCasualties(selected.yield_kt, city)
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: '0.6rem', letterSpacing: '0.08em', color: '#f0cc00', fontFamily: 'Share Tech Mono, monospace' }}>
                      {selected.name.toUpperCase()}
                    </span>
                    <span style={{ color: '#3a3600', fontSize: '0.5rem' }}>▸</span>
                    <span style={{ fontSize: '0.55rem', letterSpacing: '0.07em', color: '#9a8c00', fontFamily: 'Share Tech Mono, monospace' }}>
                      {city.name.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.54rem', letterSpacing: '0.07em', color: '#c83030', fontFamily: 'Share Tech Mono, monospace' }}>
                      DEAD&nbsp;{fmtN(cas.deaths)}
                    </span>
                    <span style={{ color: '#3a3600', fontSize: '0.5rem' }}>·</span>
                    <span style={{ fontSize: '0.54rem', letterSpacing: '0.07em', color: '#c86020', fontFamily: 'Share Tech Mono, monospace' }}>
                      CASL&nbsp;{fmtN(cas.deaths + cas.injuries)}
                    </span>
                    <span style={{ color: '#3a3600', fontSize: '0.5rem' }}>·</span>
                    <span style={{ fontSize: '0.54rem', letterSpacing: '0.07em', color: '#c9a800', fontFamily: 'Share Tech Mono, monospace' }}>
                      AREA&nbsp;{fmtArea(cas.area_km2)}
                    </span>
                  </div>
                </div>
              )
            })()
          ) : (
            <span style={{ fontSize: '0.68rem', letterSpacing: '0.18em', color: '#9a8c00', fontFamily: 'Share Tech Mono, monospace' }}>
              {phase === 'idle' ? 'NO TARGET SELECTED' : phase === 'ready' ? 'TARGET LOCKED' : 'DETONATING...'}
            </span>
          )}
        </div>
      </div>

      {/* Detonation screen */}
      <AnimatePresence>
        {phase === 'detonating' && (
          <DetonationScreen
            key="detonation"
            selected={selected}
            city={city}
            onClose={handleDetonationClose}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
