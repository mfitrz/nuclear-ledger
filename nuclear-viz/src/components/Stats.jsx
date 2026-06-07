import { useEffect, useRef, useState } from 'react'
import { useAnimatedValue } from '../hooks/useAnimatedValue'
import { calcFalloutRadius } from '../lib/physics'
import { getEnvCollapse, getEnvRiskColor, getAtmosphericContamination } from '../lib/envAnalysis'

const MAX_YIELD = 50000 // Tsar Bomba kt

function ProgressBar({ value, max, label, suffix = '' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const displayPct = Math.round(pct)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="section-label">{label}</span>
        <span className="text-terminal-primary text-xs font-mono tracking-widest">
          {value > 0 ? `${value.toFixed(value < 10 ? 1 : 0)}${suffix}` : '---'}
        </span>
      </div>
      <div className="progress-track rounded-none">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </div>
      <div className="flex justify-end">
        <span className="section-label">{displayPct}%</span>
      </div>
    </div>
  )
}

function DataRow({ label, value, highlight = false }) {
  return (
    <div
      className="flex items-start justify-between gap-2 py-1.5 border-b"
      style={{ borderColor: 'rgba(201,168,0,0.1)' }}
    >
      <span className="section-label flex-shrink-0">{label}:</span>
      <span
        className={`text-xs font-mono tracking-wider text-right leading-snug ${highlight ? 'text-terminal-bright' : 'text-terminal-primary'}`}
        style={{ maxWidth: '60%', wordBreak: 'break-word' }}
      >
        {value || '---'}
      </span>
    </div>
  )
}

export function DataPanels({ selected, allDetonations }) {
  const animYield = useAnimatedValue(selected?.yield_kt ?? 0, [selected?.name])
  const falloutR = selected ? calcFalloutRadius(selected.yield_kt, selected.test_type) : 0
  const animFallout = useAnimatedValue(falloutR, [selected?.name])

  const totalYield = allDetonations.reduce((s, d) => s + (d.yield_kt || 0), 0)
  const envColor = getEnvRiskColor(selected?.yield_kt)
  const envCollapse = selected ? getEnvCollapse(selected.yield_kt) : 'SIMULATING...'
  const atmos = selected ? getAtmosphericContamination(selected.test_type, selected.yield_kt) : 'ANALYZING YIELDS...'

  return (
    <div
      id="data-panels"
      className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t"
      style={{ borderColor: 'rgba(201,168,0,0.25)' }}
    >
      {/* YIELD PARAMETERS */}
      <div className="terminal-panel p-4 border-r" style={{ borderColor: 'rgba(201,168,0,0.15)' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 border border-terminal-primary flex items-center justify-center flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-terminal-primary" />
          </div>
          <span className="text-terminal-bright text-xs tracking-widest font-mono">YIELD_PARAMETERS</span>
        </div>

        <div className="space-y-0">
          <DataRow label="DESIGNATION" value={selected?.name?.toUpperCase()} highlight />
          <DataRow label="NATION"      value={selected?.country?.toUpperCase()} />
          <DataRow label="EST_YIELD"   value={selected ? `${animYield.toLocaleString()} KT` : null} highlight />
          <DataRow label="TEST_TYPE"   value={selected?.test_type?.toUpperCase()} />
          <DataRow label="SITE"        value={selected?.site?.toUpperCase()} />
          <DataRow label="YEAR"        value={selected?.year?.toString()} />
        </div>

        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(201,168,0,0.15)' }}>
          <div className="section-label mb-1">ARCHIVE TOTAL YIELD</div>
          <div className="text-terminal-bright text-lg font-mono tracking-widest" style={{ textShadow: '0 0 10px rgba(240,204,0,0.3)' }}>
            {totalYield.toLocaleString()} KT
          </div>
          <div className="section-label mt-1">
            ≈ {Math.round(totalYield / 15).toLocaleString()} × HIROSHIMA
          </div>
        </div>
      </div>

      {/* ATMOSPHERIC SIM */}
      <div className="terminal-panel p-4 border-r" style={{ borderColor: 'rgba(201,168,0,0.15)' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 border border-terminal-primary flex items-center justify-center flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-terminal-primary" />
          </div>
          <span className="text-terminal-bright text-xs tracking-widest font-mono">ATMOSPHERIC_SIM</span>
        </div>

        <div className="space-y-5">
          <ProgressBar label="THERMAL PROPAGATION" value={selected?.yield_kt ?? 0} max={MAX_YIELD} suffix=" KT" />
          <ProgressBar label="FALLOUT RADIUS"       value={animFallout}             max={calcFalloutRadius(MAX_YIELD, 'Atmospheric')} suffix=" KM" />
          <ProgressBar label="RELATIVE SCALE"       value={selected ? Math.log(selected.yield_kt + 1) : 0} max={Math.log(MAX_YIELD + 1)} />
        </div>

        <div className="mt-5 pt-3 border-t space-y-2" style={{ borderColor: 'rgba(201,168,0,0.15)' }}>
          <DataRow label="DELIVERY_TYPE" value={selected?.test_type?.toUpperCase()} />
          <DataRow label="OVERPRESSURE"  value={selected ? `${(selected.yield_kt * 0.34).toFixed(0)} PSI @ GZ` : null} />
        </div>
      </div>

      {/* CONSEQUENTIAL DATA */}
      <div className="terminal-panel p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 border border-terminal-primary flex items-center justify-center flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-terminal-primary" />
          </div>
          <span className="text-terminal-bright text-xs tracking-widest font-mono">CONSEQUENTIAL_DATA</span>
        </div>

        <div className="space-y-0">
          <div className="py-1.5 border-b" style={{ borderColor: 'rgba(201,168,0,0.1)' }}>
            <div className="section-label mb-1">LONG-TERM ENV. COLLAPSE:</div>
            <div
              className="text-xs font-mono tracking-wider"
              style={{ color: envColor, textShadow: selected && selected.yield_kt >= 1000 ? '0 0 8px rgba(200,48,48,0.4)' : 'none' }}
            >
              {envCollapse}
            </div>
          </div>

          <div className="py-1.5 border-b" style={{ borderColor: 'rgba(201,168,0,0.1)' }}>
            <div className="section-label mb-1">ATMOSPHERIC CONTAMINATION:</div>
            <div className="text-terminal-primary text-xs font-mono tracking-wider leading-relaxed">
              {atmos || 'ANALYZING YIELDS...'}
            </div>
          </div>

          <DataRow
            label="CRATER_RADIUS"
            value={selected ? `${(0.0077 * Math.pow(selected.yield_kt, 0.333)).toFixed(2)} KM` : null}
          />
          <DataRow
            label="WIND_DISPERSAL"
            value={
              selected?.test_type === 'Underground'
                ? 'CONTAINED // MINIMAL'
                : selected?.test_type === 'Exoatmospheric'
                  ? 'STRATOSPHERIC EMP'
                  : selected
                    ? 'REGIONAL FALLOUT PATTERN'
                    : null
            }
          />
        </div>

        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(201,168,0,0.15)' }}>
          <div className="section-label mb-1">ARCHIVE STATUS</div>
          <div className="text-terminal-dim text-xs font-mono tracking-wider">
            {selected
              ? `RECORD ${allDetonations.findIndex((d) => d.name === selected.name) + 1} OF ${allDetonations.length}`
              : `${allDetonations.length} RECORDS INDEXED`}
          </div>
        </div>
      </div>
    </div>
  )
}
