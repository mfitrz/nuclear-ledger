import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { gsap } from 'gsap'
import L from 'leaflet'
import { BLAST_ZONES } from '../../constants/blastZones'

export function AnimatedBlastZones({ selected, center, maxRadius_m }) {
  const map = useMap()
  const layersRef = useRef([])
  const tweensRef = useRef([])

  useEffect(() => {
    layersRef.current.forEach((l) => l?.remove())
    tweensRef.current.forEach((t) => t?.kill())
    layersRef.current = []
    tweensRef.current = []

    if (!selected || !maxRadius_m) return

    // Create all circles at radius 0, outermost first (rendered underneath)
    const reversed = [...BLAST_ZONES].reverse()
    layersRef.current = reversed.map((zone) =>
      L.circle(center, {
        radius: 0,
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: zone.fill,
        weight: zone.weight,
        opacity: 0.9,
        interactive: false,
      }).addTo(map)
    )

    // Animate innermost (fireball) fastest; outermost slowest — like a real shockwave
    const forwardOrder = [...BLAST_ZONES]
    tweensRef.current = forwardOrder.map((zone, i) => {
      const layerIdx = reversed.findIndex((z) => z.name === zone.name)
      const layer = layersRef.current[layerIdx]
      const targetR = maxRadius_m * zone.fraction
      if (targetR < 20) return null

      const proxy = { r: 0 }
      const duration = 0.55 + i * 0.35

      return gsap.to(proxy, {
        r: targetR,
        duration,
        delay: 0,
        ease: 'power3.out',
        onUpdate() { layer.setRadius(proxy.r) },
      })
    })

    return () => {
      layersRef.current.forEach((l) => l?.remove())
      tweensRef.current.forEach((t) => t?.kill())
    }
  }, [selected?.name, center[0], center[1], maxRadius_m, map]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
