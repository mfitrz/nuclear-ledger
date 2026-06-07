import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ComposableMap, Geographies, Geography, Marker, Sphere, Graticule } from 'react-simple-maps'

import { COUNTRY_COLORS, COUNTRY_ABBR, getColor } from '../../constants/countries'
import { getMarkerSize, isFrontFacing, buildClusters } from '../../lib/globeUtils'
import { fmtYieldShort } from '../../lib/format'
import { ZoomBtn } from './ZoomBtn'
import { InfoOverlay } from './InfoOverlay'
import { DetonationPicker } from './DetonationPicker'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

export function Globe({ detonations, selected, onSelect }) {
  const outerRef = useRef(null)
  const [outerSize, setOuterSize] = useState({ w: 600, h: 500 })
  const [scale, setScale] = useState(180)
  const scaleRef = useRef(180)
  const initialScaleRef = useRef(null)
  const [rotation, setRotation] = useState([20, -25, 0])
  const rotRef = useRef([20, -25, 0])
  const dragStartRef = useRef(null)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const dragDistRef = useRef(0)
  const rotTweenRef = useRef(null)
  const pickerOpenRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredKey, setHoveredKey] = useState(null)
  const [pickerGroup, setPickerGroup] = useState(null)
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 })
  const [pingKey, setPingKey] = useState(null)
  const pickerTimerRef = useRef(null)

  const locationGroups = useMemo(() => buildClusters(detonations), [detonations])

  useEffect(() => {
    pickerOpenRef.current = !!pickerGroup
  }, [pickerGroup])

  const rotateToPoint = useCallback((lng, lat) => {
    if (rotTweenRef.current) rotTweenRef.current.kill()
    const startRot = [...rotRef.current]
    const targetLon = -lng
    const targetLat = Math.max(-88, Math.min(88, -lat))
    let dLon = targetLon - startRot[0]
    if (dLon > 180) dLon -= 360
    if (dLon < -180) dLon += 360
    const proxy = { t: 0 }
    rotTweenRef.current = gsap.to(proxy, {
      t: 1,
      duration: 1.1,
      ease: 'power2.inOut',
      onUpdate() {
        const r = [
          startRot[0] + dLon * proxy.t,
          startRot[1] + (targetLat - startRot[1]) * proxy.t,
          0,
        ]
        rotRef.current = r
        setRotation([...r])
      },
    })
  }, [])

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setOuterSize({ w: width, h: height })
      const s = Math.min(width, height) * 0.47
      if (initialScaleRef.current === null) {
        setScale(s)
        scaleRef.current = s
      }
      initialScaleRef.current = s
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const onWheel = (e) => {
      if (pickerOpenRef.current) return
      e.preventDefault()
      const minS = initialScaleRef.current ?? 80
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
      const next = Math.max(minS, Math.min(scaleRef.current * factor, 12000))
      scaleRef.current = next
      setScale(next)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const lastPinchDistRef = useRef(null)
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const onTouchMove = (e) => {
      if (e.touches.length !== 2) {
        lastPinchDistRef.current = null
        return
      }
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (lastPinchDistRef.current !== null) {
        const factor = dist / lastPinchDistRef.current
        const minS = initialScaleRef.current ?? 80
        const next = Math.max(minS, Math.min(scaleRef.current * factor, 12000))
        scaleRef.current = next
        setScale(next)
      }
      lastPinchDistRef.current = dist
    }
    const onTouchEnd = () => { lastPinchDistRef.current = null }
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const adjustZoom = useCallback((zoomIn) => {
    const minS = initialScaleRef.current ?? 80
    const factor = zoomIn ? 1.28 : 1 / 1.28
    const next = Math.max(minS, Math.min(scaleRef.current * factor, 12000))
    scaleRef.current = next
    setScale(next)
  }, [])

  const handlePointerDown = useCallback((e) => {
    if (pickerOpenRef.current) return
    if (rotTweenRef.current) rotTweenRef.current.kill()
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    lastPosRef.current = { x: e.clientX, y: e.clientY }
    dragDistRef.current = 0
    setIsDragging(false)
  }, [])

  const handlePointerMove = useCallback(
    (e) => {
      if (pickerOpenRef.current || !dragStartRef.current) return
      const dx = e.clientX - lastPosRef.current.x
      const dy = e.clientY - lastPosRef.current.y
      const tdx = e.clientX - dragStartRef.current.x
      const tdy = e.clientY - dragStartRef.current.y
      dragDistRef.current = Math.sqrt(tdx * tdx + tdy * tdy)
      if (dragDistRef.current > 4) {
        setIsDragging(true)
        setPickerGroup(null)
        const base = Math.min(outerSize.w, outerSize.h)
        const sens = (0.25 * base) / scaleRef.current
        const newRot = [
          rotRef.current[0] + dx * sens,
          Math.max(-88, Math.min(88, rotRef.current[1] - dy * sens)),
          0,
        ]
        rotRef.current = newRot
        setRotation([...newRot])
      }
      lastPosRef.current = { x: e.clientX, y: e.clientY }
    },
    [outerSize.w, outerSize.h]
  )

  const handlePointerUp = useCallback(() => {
    dragStartRef.current = null
    setIsDragging(false)
  }, [])

  const handleMarkerClick = useCallback(
    (loc, e) => {
      e.stopPropagation()
      if (dragDistRef.current >= 6) return
      clearTimeout(pickerTimerRef.current)
      setPickerGroup(null)
      const targetLon = -loc.lng
      const targetLat = Math.max(-88, Math.min(88, -loc.lat))
      const alreadyCentered =
        Math.abs(rotRef.current[0] - targetLon) < 3 && Math.abs(rotRef.current[1] - targetLat) < 3
      rotateToPoint(loc.lng, loc.lat)
      if (loc.count > 1) {
        const delay = alreadyCentered ? 0 : 1200
        pickerTimerRef.current = setTimeout(() => {
          const el = outerRef.current
          if (!el) return
          const w = el.offsetWidth
          const h = el.offsetHeight
          setPickerPos({ x: w / 2, y: h / 2 + 20 })
          setPickerGroup(loc.dets)
        }, delay)
      } else {
        setPickerGroup(null)
        onSelect(loc.dets[0])
        setPingKey(loc.dets[0].name)
      }
    },
    [onSelect, rotateToPoint, outerSize.w, outerSize.h]
  )

  const handlePickerSelect = useCallback(
    (det) => {
      onSelect(det)
      setPingKey(det.name)
      const cluster = locationGroups.find((g) => g.dets.some((d) => d.name === det.name))
      if (cluster) rotateToPoint(cluster.lng, cluster.lat)
    },
    [onSelect, rotateToPoint, locationGroups]
  )

  const innerSize = Math.max(80, Math.min(outerSize.w, outerSize.h) * 0.98)
  const earthFillsClip = scale >= innerSize * 0.5
  const clipW = earthFillsClip ? outerSize.w : innerSize
  const clipH = earthFillsClip ? outerSize.h : innerSize
  const clipR = earthFillsClip ? '0%' : '50%'
  const refScale = initialScaleRef.current ?? innerSize * 0.47
  const zoomFactor = Math.max(0.35, scale / refScale)
  const markerSizeMult = Math.sqrt(innerSize / 480) * zoomFactor
  const labelFontSize = Math.max(8, Math.sqrt(innerSize / 480) * 11)
  const visibleSelected = pickerGroup ? null : selected

  return (
    <div className="relative w-full h-full flex flex-col select-none">
      <div
        className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(201,168,0,0.15)' }}
      >
        <div>
          <div className="text-terminal-bright text-xs tracking-widest font-mono">GLOBAL THREAT MAP</div>
          <div className="section-label mt-0.5 hidden md:block">
            CLICK, HOLD AND DRAG TO PAN · SCROLL TO ZOOM · CLICK TO SELECT
          </div>
          <div className="section-label mt-0.5 block md:hidden">
            HOLD AND DRAG TO PAN· PINCH TO ZOOM · TAP TO SELECT
          </div>
        </div>
      </div>

      <div
        ref={outerRef}
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: 0 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div style={{
          width: clipW, height: clipH, borderRadius: clipR,
          overflow: 'hidden', flexShrink: 0,
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative', transition: 'border-radius 0.25s ease',
        }}>
          <ComposableMap
            width={clipW} height={clipH}
            projection="geoOrthographic"
            projectionConfig={{ rotate: rotation, scale }}
            style={{ width: clipW, height: clipH, display: 'block' }}
          >
            <Sphere fill="rgba(201,168,0,0.04)" stroke="rgba(201,168,0,0.55)" strokeWidth={0.8} />
            <Graticule stroke="rgba(201,168,0,0.07)" strokeWidth={0.4} step={[30, 30]} />
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="rgba(201,168,0,0.11)"
                    stroke="rgba(201,168,0,0.2)"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: 'rgba(201,168,0,0.11)' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {locationGroups.map((loc) => {
              if (!isFrontFacing(loc.lng, loc.lat, rotation)) return null
              const color = getColor(loc.country)
              const size = getMarkerSize(loc.maxYield) * markerSizeMult
              const isSel = loc.dets.some((d) => d.name === selected?.name)
              const isHov = hoveredKey === loc.key
              const isMulti = loc.count > 1
              const glowBlur = (size * 0.55).toFixed(1)
              const selBlur = (size * 0.9).toFixed(1)

              return (
                <Marker
                  key={loc.key}
                  coordinates={[loc.lng, loc.lat]}
                  onClick={(e) => handleMarkerClick(loc, e)}
                >
                  {isSel && (() => {
                    const selColor = getColor(selected?.country)
                    const selName = (selected?.name || '').toUpperCase()
                    const truncated = selName.length > 32 ? selName.slice(0, 31) + '…' : selName
                    const baseY = -(size * 3.6 + labelFontSize * 0.5)
                    return (
                      <>
                        <text
                          x={0} y={baseY - labelFontSize * 1.35}
                          textAnchor="middle" fill={selColor}
                          fontSize={labelFontSize * 0.95}
                          fontFamily="Share Tech Mono, monospace"
                          letterSpacing="1.5"
                          className="nk-selected-label"
                          style={{ pointerEvents: 'none' }}
                        >
                          {truncated}
                        </text>
                        <text
                          x={0} y={baseY}
                          textAnchor="middle" fill={selColor}
                          fontSize={labelFontSize}
                          fontFamily="Share Tech Mono, monospace"
                          letterSpacing="2"
                          className="nk-selected-label"
                          style={{ pointerEvents: 'none' }}
                        >
                          ☢ SELECTED
                        </text>
                      </>
                    )
                  })()}
                  {isSel && (
                    <circle r={size * 1.9} fill={color} fillOpacity={0.06} style={{ pointerEvents: 'none' }} />
                  )}
                  <circle r={size * 1.7} fill={color} fillOpacity={isHov ? 0.09 : 0.04} style={{ pointerEvents: 'none' }} />
                  <circle r={size} fill={color} fillOpacity={isHov ? 0.2 : 0.12} style={{ pointerEvents: 'none' }} />
                  <circle
                    r={size * 0.65}
                    fill={color}
                    fillOpacity={isSel || isHov ? 1 : 0.88}
                    style={{
                      filter: isSel
                        ? `drop-shadow(0 0 ${selBlur}px ${color}) drop-shadow(0 0 ${(parseFloat(selBlur) * 1.6).toFixed(1)}px ${color})`
                        : isHov
                          ? `drop-shadow(0 0 ${(size * 0.4).toFixed(1)}px ${color})`
                          : `drop-shadow(0 0 ${glowBlur}px ${color})`,
                      cursor: 'pointer', pointerEvents: 'all',
                      transition: 'filter 0.15s, fill-opacity 0.15s',
                    }}
                    onMouseEnter={() => setHoveredKey(loc.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                  />
                  <circle r={size * 0.38} fill="#ffe040" fillOpacity={0.95} style={{ pointerEvents: 'none' }} />
                  <circle r={size * 0.17} fill="#ffffff" style={{ pointerEvents: 'none' }} />
                  {isMulti && (
                    <>
                      <circle
                        cx={size * 1.0} cy={-size * 1.0} r={size * 0.58}
                        fill="rgba(8,7,0,0.92)" stroke={color} strokeWidth={0.7}
                        style={{ pointerEvents: 'none' }}
                      />
                      <text
                        x={size * 1.0} y={-size * 1.0 + size * 0.2}
                        textAnchor="middle" fill={color} fontSize={size * 0.56}
                        fontFamily="Share Tech Mono, monospace"
                        style={{ pointerEvents: 'none' }}
                      >
                        {loc.count}
                      </text>
                    </>
                  )}
                </Marker>
              )
            })}
          </ComposableMap>
        </div>

        {/* Zoom buttons — desktop only */}
        <div className="hidden md:flex" style={{ position: 'absolute', top: 12, right: 12, flexDirection: 'column', gap: 4, zIndex: 10 }}>
          <ZoomBtn label="+" onClick={() => adjustZoom(true)} />
          <ZoomBtn label="−" onClick={() => adjustZoom(false)} />
        </div>

        {/* Info overlay — desktop only */}
        <AnimatePresence mode="wait">
          {visibleSelected && (
            <div key={visibleSelected.name} className="hidden md:block" style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
              <InfoOverlay selected={visibleSelected} />
            </div>
          )}
        </AnimatePresence>

        {/* Mobile country legend */}
        <div
          className="flex md:hidden flex-col"
          style={{
            position: 'absolute', top: 8, right: 8, zIndex: 10,
            background: 'rgba(7,6,0,0.88)', border: '1px solid rgba(201,168,0,0.2)',
            backdropFilter: 'blur(6px)', padding: '5px 8px', gap: 3,
          }}
        >
          {Object.entries(COUNTRY_COLORS)
            .filter(([c]) => c !== 'Unknown')
            .map(([country, color]) => (
              <div key={country} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="7" height="7" viewBox="-4 -4 8 8" style={{ flexShrink: 0 }}>
                  <circle r="3.2" fill={color} fillOpacity={0.25} />
                  <circle r="2.2" fill={color} />
                  <circle r="1.1" fill="#ffe040" fillOpacity={0.8} />
                </svg>
                <span style={{ fontSize: '0.5rem', letterSpacing: '0.1em', color: '#9a8c00', fontFamily: 'Share Tech Mono, monospace', whiteSpace: 'nowrap' }}>
                  {COUNTRY_ABBR[country] || country}
                </span>
              </div>
            ))}
        </div>

        {/* Picker overlay */}
        <AnimatePresence>
          {pickerGroup && (
            <DetonationPicker
              group={pickerGroup}
              onSelect={handlePickerSelect}
              onClose={() => { clearTimeout(pickerTimerRef.current); setPickerGroup(null) }}
              selected={selected}
              pos={pickerPos}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div
        className="border-t flex-shrink-0"
        style={{ borderColor: 'rgba(201,168,0,0.15)', height: 72, minHeight: 72, maxHeight: 72, flexShrink: 0, overflow: 'hidden' }}
      >
        {/* Desktop: full country legend */}
        <div
          className="hidden md:flex px-4 flex-wrap items-center gap-x-5 gap-y-1"
          style={{ height: '100%', paddingTop: 8, paddingBottom: 8 }}
        >
          {Object.entries(COUNTRY_COLORS)
            .filter(([c]) => c !== 'Unknown')
            .map(([country, color]) => (
              <div key={country} className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="-5 -5 10 10">
                  <circle r="4.2" fill={color} fillOpacity={0.25} />
                  <circle r="2.8" fill={color} />
                  <circle r="1.4" fill="#ffe040" fillOpacity={0.7} />
                </svg>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.09em', color: '#9a8c00' }}>
                  {country.toUpperCase()}
                </span>
              </div>
            ))}
        </div>

        {/* Mobile: selected detonation stats */}
        <div className="flex md:hidden px-3 items-center" style={{ height: '100%' }}>
          {visibleSelected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: getColor(visibleSelected.country), flexShrink: 0 }} />
                <span style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: '#f0cc00', fontFamily: 'Share Tech Mono, monospace' }}>
                  {visibleSelected.name.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.52rem', letterSpacing: '0.08em', color: getColor(visibleSelected.country), fontFamily: 'Share Tech Mono, monospace' }}>
                  {COUNTRY_ABBR[visibleSelected.country] || visibleSelected.country}
                </span>
                <span style={{ fontSize: '0.5rem', letterSpacing: '0.06em', color: '#8a7c00', fontFamily: 'Share Tech Mono, monospace' }}>
                  {visibleSelected.year}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.56rem', letterSpacing: '0.08em', color: '#c9a800', fontFamily: 'Share Tech Mono, monospace' }}>
                  {fmtYieldShort(visibleSelected.yield_kt)}
                </span>
                <span style={{ color: '#3a3600', fontSize: '0.5rem' }}>·</span>
                <span style={{ fontSize: '0.5rem', letterSpacing: '0.07em', color: '#9a8c00', fontFamily: 'Share Tech Mono, monospace' }}>
                  {visibleSelected.test_type?.toUpperCase() || '---'}
                </span>
                {visibleSelected.site && (
                  <>
                    <span style={{ color: '#3a3600', fontSize: '0.5rem' }}>·</span>
                    <span style={{ fontSize: '0.48rem', letterSpacing: '0.06em', color: '#8a7c00', fontFamily: 'Share Tech Mono, monospace' }}>
                      {visibleSelected.site.toUpperCase()}
                    </span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <span style={{ fontSize: '0.68rem', letterSpacing: '0.18em', color: '#9a8c00', fontFamily: 'Share Tech Mono, monospace' }}>
              NO DETONATION SELECTED
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
