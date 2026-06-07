import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export function PanTracker({ onMoveEnd }) {
  const map = useMap()
  useEffect(() => {
    map.on('moveend', onMoveEnd)
    return () => map.off('moveend', onMoveEnd)
  }, [map, onMoveEnd])
  return null
}
