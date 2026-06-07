import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export function MapController({ center }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.1, easeLinearity: 0.4 })
  }, [center[0], center[1]]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
