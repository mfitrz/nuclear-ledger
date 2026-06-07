import { BLAST_ZONES } from '../../constants/blastZones'
import { calcCasualties, calcFalloutArea, calcStructDamage, calcDamage } from '../../lib/physics'
import { fmtN, fmtArea } from '../../lib/format'

export function ImpactCard({ selected, city, mapW }) {
  if (!selected) return null

  const compact = mapW < 380
  const fs = Math.min(1.4, Math.max(1, mapW / 380))
  const pad = compact ? '6px 8px' : '10px 12px'
  const labelFs = `${(compact ? 0.42 : 0.46) * fs}rem`
  const valueFs = `${(compact ? 0.5 : 0.56) * fs}rem`
  const titleFs = `${(compact ? 0.52 : 0.6) * fs}rem`
  const cardMaxW = Math.min(290, Math.max(150, mapW * 0.42))

  const cas = calcCasualties(selected.yield_kt, city)
  const fallout = calcFalloutArea(selected.yield_kt, selected.test_type)
  const struct = calcStructDamage(selected.yield_kt)

  const rows = [
    { label: 'DEATHS (IMMEDIATE)', value: fmtN(cas.deaths),                    color: '#c83030' },
    { label: 'TOTAL CASUALTIES',   value: fmtN(cas.deaths + cas.injuries),     color: '#c86020' },
    { label: 'STRUCTURAL DAMAGE',  value: calcDamage(selected.yield_kt, city), color: '#dcb400' },
    { label: 'BLAST AREA',         value: fmtArea(cas.area_km2),               color: '#c9a800' },
    { label: 'FALLOUT ZONE',       value: fmtArea(fallout),                    color: '#9a8c00' },
    { label: 'RUBBLE ZONE',        value: fmtArea(struct),                     color: '#9a8c00' },
  ]

  return (
    <div style={{
      position: 'absolute', top: 10, right: 10, zIndex: 500,
      background: 'rgba(7,6,0,0.92)', border: '1px solid rgba(201,168,0,0.25)',
      backdropFilter: 'blur(8px)', padding: pad,
      maxWidth: cardMaxW, minWidth: compact ? 130 : 155,
      boxShadow: '0 0 24px rgba(200,48,0,0.12)', pointerEvents: 'none',
    }}>
      <div style={{ fontSize: titleFs, letterSpacing: '0.12em', color: '#f0cc00', fontFamily: 'Share Tech Mono, monospace', marginBottom: 3 }}>
        IMPACT ASSESSMENT
      </div>
      <div style={{ fontSize: labelFs, letterSpacing: '0.1em', color: '#8a7c00', marginBottom: 6, wordBreak: 'break-word' }}>
        {selected.name.toUpperCase()}&nbsp;▸&nbsp;{city.name.toUpperCase()}
      </div>
      {rows.map(({ label, value, color }) => (
        <div
          key={label}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6,
            paddingBottom: 2, marginBottom: 2, borderBottom: '1px solid rgba(201,168,0,0.07)',
          }}
        >
          <span style={{ fontSize: labelFs, letterSpacing: '0.1em', color: '#8a7c00', flexShrink: 0 }}>
            {label}
          </span>
          <span style={{ fontSize: valueFs, letterSpacing: '0.05em', color, fontFamily: 'Share Tech Mono, monospace' }}>
            {value}
          </span>
        </div>
      ))}
      <div style={{ marginTop: 5, fontSize: '0.4rem', letterSpacing: '0.1em', color: 'rgba(90,82,0,0.55)' }}>
        ⚠ ESTIMATES ONLY
      </div>
    </div>
  )
}
