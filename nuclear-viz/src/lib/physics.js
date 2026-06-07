import { BLAST_ZONES } from '../constants/blastZones'

export function calcMaxRadius(yield_kt) {
  if (!yield_kt || yield_kt <= 0) return 0
  return 1.84 * Math.pow(yield_kt, 1 / 3) * 1000
}

export function calcCasualties(yield_kt, city) {
  const r_max_km = 1.84 * Math.pow(yield_kt, 1 / 3)
  const { density } = city
  const coreRadius = 12
  let deaths = 0, injuries = 0, prevR = 0
  BLAST_ZONES.forEach((z) => {
    const outerR = r_max_km * z.fraction
    const annulus = Math.PI * (outerR * outerR - prevR * prevR)
    const avgR = (outerR + prevR) / 2
    const df = avgR < coreRadius ? 1 : avgR < coreRadius * 2.5 ? 0.28 : 0.05
    const pop = annulus * density * df
    deaths += pop * z.fatal
    injuries += pop * z.inj
    prevR = outerR
  })
  return {
    deaths: Math.round(Math.max(0, deaths)),
    injuries: Math.round(Math.max(0, injuries)),
    area_km2: Math.round(Math.PI * r_max_km * r_max_km),
  }
}

export function calcDamage(yield_kt, city) {
  const usd = yield_kt * 0.25 * city.gdp
  if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}T`
  if (usd >= 1) return `$${Math.round(usd)}B`
  return `$${Math.round(usd * 1000)}M`
}

// Returns fallout-affected area in km² — uses blast-spread multipliers
export function calcFalloutArea(yield_kt, test_type) {
  const r_km = 1.84 * Math.pow(yield_kt, 1 / 3)
  const m =
    test_type === 'Atmospheric'    ? 10 :
    test_type === 'Surface'        ? 6  :
    test_type === 'Underwater'     ? 5  :
    test_type === 'Exoatmospheric' ? 1  : 0.4
  return Math.round(Math.PI * r_km * r_km * m)
}

// Returns fallout radius in km — uses dispersion multipliers
export function calcFalloutRadius(yield_kt, test_type) {
  if (!yield_kt || yield_kt <= 0) return 0
  const base = 1.84 * Math.pow(yield_kt, 1 / 3)
  const m =
    test_type === 'Atmospheric'  ? 2.5 :
    test_type === 'Surface'      ? 2.0 :
    test_type === 'Underground'  ? 0.6 :
    test_type === 'Underwater'   ? 1.8 : 1.0
  return base * m
}

export function calcStructDamage(yield_kt) {
  const r_km = 1.84 * Math.pow(yield_kt, 1 / 3) * 0.076
  return Math.round(Math.PI * r_km * r_km)
}

export function calcCraterKm(yield_kt) {
  if (!yield_kt || yield_kt <= 0) return null
  return (0.0077 * Math.pow(yield_kt, 1 / 3)).toFixed(3)
}

export function calcOverpressure(yield_kt) {
  if (!yield_kt || yield_kt <= 0) return null
  return `${Math.round(yield_kt * 0.34)} PSI AT GROUND ZERO`
}
