import { useEffect, useState } from 'react'

export function useClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = String(now.getHours()).padStart(2, '0')
      const m = String(now.getMinutes()).padStart(2, '0')
      const s = String(now.getSeconds()).padStart(2, '0')
      const ms = String(now.getMilliseconds()).padStart(3, '0')
      setTime(`${h}:${m}:${s}:${ms}`)
    }
    update()
    const id = setInterval(update, 50)
    return () => clearInterval(id)
  }, [])
  return time
}
