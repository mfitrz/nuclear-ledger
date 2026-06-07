import { motion } from 'framer-motion'
import { getColor } from '../../constants/countries'
import { calcFalloutRadius, calcCraterKm, calcOverpressure } from '../../lib/physics'
import { fmtYieldShort } from '../../lib/format'
import { getEnvRisk, getEnvRiskColor, getAtmosphericContamination } from '../../lib/envAnalysis'
import {
  PANEL_BG, PANEL_BLUR, PANEL_MAX_W, PANEL_MIN_W,
  FS_TITLE, FS_LABEL, FS_VALUE, FS_META,
} from './panelStyles'

export function InfoOverlay({ selected }) {
  if (!selected) return null

  const color = getColor(selected.country)
  const nation = selected.country.toUpperCase()
  const envRisk = getEnvRisk(selected.yield_kt)
  const envColor = getEnvRiskColor(selected.yield_kt)
  const atmos = getAtmosphericContamination(selected.test_type, selected.yield_kt)
  const fallout = calcFalloutRadius(selected.yield_kt, selected.test_type)
  const crater = calcCraterKm(selected.yield_kt)
  const overp = calcOverpressure(selected.yield_kt)

  const rows = [
    { label: 'YEAR',           value: selected.year },
    { label: 'YIELD',          value: fmtYieldShort(selected.yield_kt), bright: true },
    { label: 'TYPE',           value: selected.test_type?.toUpperCase() },
    { label: 'NATION',         value: nation },
    { label: 'SITE',           value: selected.site?.toUpperCase() },
    { label: 'FALLOUT RADIUS', value: fallout ? `${fallout.toFixed(1)} KM` : '---' },
    { label: 'CRATER RADIUS',  value: crater ? `${crater} KM` : '---' },
    { label: 'OVERPRESSURE',   value: overp || '---' },
  ]

  return (
    <motion.div
      key={selected.name}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      style={{
        background: PANEL_BG,
        border: `1px solid ${color}50`,
        backdropFilter: PANEL_BLUR,
        padding: '11px 14px',
        maxWidth: PANEL_MAX_W,
        minWidth: PANEL_MIN_W,
        boxShadow: `0 0 28px ${color}18`,
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <svg width="13" height="13" viewBox="-5 -5 10 10" style={{ overflow: 'visible', flexShrink: 0 }}>
          <circle r="4.2" fill={color} fillOpacity={0.25} />
          <circle r="2.8" fill={color} />
          <circle r="1.5" fill="#ffe040" />
          <circle r="0.7" fill="#ffffff" />
        </svg>
        <span style={{ fontSize: FS_TITLE, letterSpacing: '0.1em', color, textShadow: `0 0 8px ${color}55`, lineHeight: 1.25 }}>
          {selected.name.toUpperCase()}
        </span>
      </div>

      {rows.map(({ label, value, bright }) => (
        <div
          key={label}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            gap: 10, paddingBottom: 3, marginBottom: 3,
            borderBottom: '1px solid rgba(201,168,0,0.08)',
          }}
        >
          <span style={{ fontSize: FS_LABEL, letterSpacing: '0.12em', color: '#8a7c00', flexShrink: 0 }}>
            {label}
          </span>
          <span style={{
            fontSize: FS_VALUE, letterSpacing: '0.06em',
            color: bright ? '#f0cc00' : '#c9a800',
            textShadow: bright ? '0 0 6px rgba(240,204,0,0.35)' : 'none',
            textAlign: 'right', wordBreak: 'break-word',
          }}>
            {value}
          </span>
        </div>
      ))}

      {atmos && (
        <div style={{ marginTop: 5, paddingTop: 4, borderTop: '1px solid rgba(201,168,0,0.1)' }}>
          <div style={{ fontSize: FS_LABEL, letterSpacing: '0.1em', color: '#8a7c00', marginBottom: 2 }}>
            ATMOSPHERIC CONTAMINATION
          </div>
          <div style={{ fontSize: FS_VALUE, letterSpacing: '0.06em', color: '#c9a800' }}>{atmos}</div>
        </div>
      )}

      <div style={{
        marginTop: 6, paddingTop: 5, borderTop: '1px solid rgba(201,168,0,0.12)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8,
      }}>
        {envRisk && (
          <span style={{ fontSize: FS_META, letterSpacing: '0.08em', color: envColor }}>{envRisk}</span>
        )}
        <span style={{ fontSize: FS_META, letterSpacing: '0.1em', color: '#8a7c00', marginLeft: 'auto' }}>
          ≡&nbsp;
          <span style={{ color: '#c9a800' }}>
            {selected.yield_kt >= 15
              ? `${(selected.yield_kt / 15).toFixed(1)}×`
              : `${((selected.yield_kt / 15) * 100).toFixed(0)}%`}
          </span>
          &nbsp;☢
        </span>
      </div>
    </motion.div>
  )
}
