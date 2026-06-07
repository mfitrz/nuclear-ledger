import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export function useAnimatedValue(target, deps) {
  const [display, setDisplay] = useState(0)
  const tweenRef = useRef(null)
  const objRef = useRef({ val: 0 })

  useEffect(() => {
    if (tweenRef.current) tweenRef.current.kill()
    if (target === null || target === undefined || isNaN(target)) {
      setDisplay(null)
      return
    }
    tweenRef.current = gsap.to(objRef.current, {
      val: target,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => setDisplay(Math.round(objRef.current.val)),
    })
    return () => {
      if (tweenRef.current) tweenRef.current.kill()
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return display
}
