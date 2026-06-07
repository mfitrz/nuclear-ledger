import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export function MapCapture({ mapRef }) {
  const map = useMap()
  useEffect(() => {
    mapRef.current = map
    // Force Leaflet to recalculate size once the container is fully laid out
    const t = setTimeout(() => map.invalidateSize(), 50)
    return () => clearTimeout(t)
  }, [map, mapRef])
  return null
}
