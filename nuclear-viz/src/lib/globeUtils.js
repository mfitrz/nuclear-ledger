export function getMarkerSize(yield_kt) {
  if (!yield_kt || yield_kt <= 0) return 1.8
  return Math.max(1.8, Math.min(15, Math.pow(yield_kt, 1 / 3) * 0.45))
}

export function isFrontFacing(lon, lat, rotation) {
  const lonR = (lon + rotation[0]) * (Math.PI / 180)
  const latR = lat * (Math.PI / 180)
  const rot1R = rotation[1] * (Math.PI / 180)
  return Math.cos(latR) * Math.cos(lonR) * Math.cos(rot1R) - Math.sin(latR) * Math.sin(rot1R) > 0.05
}

export function buildClusters(detonations) {
  const RADIUS_DEG = 1.0
  const sorted = [...detonations].sort((a, b) => (b.yield_kt || 0) - (a.yield_kt || 0))
  const claimed = new Set()
  const clusters = []
  sorted.forEach((det) => {
    if (claimed.has(det.name)) return
    const dets = [det]
    claimed.add(det.name)
    sorted.forEach((other) => {
      if (claimed.has(other.name)) return
      const dlat = other.latitude - det.latitude
      const dlng = (other.longitude - det.longitude) * Math.cos((det.latitude * Math.PI) / 180)
      if (Math.sqrt(dlat * dlat + dlng * dlng) <= RADIUS_DEG) {
        dets.push(other)
        claimed.add(other.name)
      }
    })
    clusters.push({
      key: `${det.latitude.toFixed(3)},${det.longitude.toFixed(3)}`,
      lat: det.latitude,
      lng: det.longitude,
      dets,
      count: dets.length,
      maxYield: det.yield_kt || 0,
      country: det.country,
    })
  })
  return clusters
}
