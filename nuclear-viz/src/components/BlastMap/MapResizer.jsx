import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export function MapResizer({ containerRef }) {
  const map = useMap()
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(el)
    return () => ro.disconnect()
  }, [map, containerRef])
  return null
}
