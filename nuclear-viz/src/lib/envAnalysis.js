const ENV_LEVELS = [
  { min: 10000, risk: 'CATASTROPHIC', collapse: 'CATASTROPHIC — REGIONAL' },
  { min: 1000,  risk: 'SEVERE',       collapse: 'SEVERE — MULTI-CITY SCALE' },
  { min: 100,   risk: 'MAJOR',        collapse: 'MAJOR — CITY SCALE' },
  { min: 10,    risk: 'SIGNIFICANT',  collapse: 'SIGNIFICANT — DISTRICT SCALE' },
  { min: 0,     risk: 'LOCALIZED',    collapse: 'LOCALIZED — SITE LEVEL' },
]

// Short label used as a status badge (e.g. Globe info overlay)
export function getEnvRisk(yield_kt) {
  if (!yield_kt) return null
  return ENV_LEVELS.find((l) => yield_kt >= l.min)?.risk ?? null
}

// Full description used in data panels
export function getEnvCollapse(yield_kt) {
  if (!yield_kt) return '---'
  return ENV_LEVELS.find((l) => yield_kt >= l.min)?.collapse ?? '---'
}

export function getEnvRiskColor(yield_kt) {
  if (!yield_kt) return 'var(--color-primary)'
  if (yield_kt >= 1000) return '#c83030'
  if (yield_kt >= 100) return '#c86020'
  return 'var(--color-primary)'
}

export function getAtmosphericContamination(test_type, yield_kt) {
  if (!test_type || !yield_kt) return null
  if (test_type === 'Atmospheric' && yield_kt >= 1000) return 'GLOBAL STRATOSPHERIC DISPERSAL'
  if (test_type === 'Atmospheric')   return 'REGIONAL TROPOSPHERIC FALLOUT'
  if (test_type === 'Surface')       return 'HEAVY LOCAL FALLOUT + UPWELLING'
  if (test_type === 'Exoatmospheric') return 'EMP BURST // MINIMAL FALLOUT'
  if (test_type === 'Underwater')    return 'BASE SURGE // MARINE CONTAMINATION'
  return 'CONTAINED — SUBSURFACE VENTING'
}
