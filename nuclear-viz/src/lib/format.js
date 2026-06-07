export function fmtN(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${Math.round(n / 1000)}K`
  return `${n}`
}

export function fmtArea(n) {
  if (n >= 1000) return `${Math.round(n / 100) / 10}K KM²`
  return `${n} KM²`
}

export function fmtYield(yield_kt) {
  if (!yield_kt) return 'UNKNOWN'
  if (yield_kt >= 1000) return `${(yield_kt / 1000).toFixed(1)} MEGATONS`
  return `${yield_kt} KILOTONS`
}

export function fmtYieldShort(yield_kt) {
  if (!yield_kt) return '---'
  if (yield_kt >= 1000) return `${(yield_kt / 1000).toFixed(yield_kt >= 10000 ? 0 : 1)} MEGATONS`
  return `${yield_kt} KILOTONS`
}
