import { useEffect, useRef, useState } from 'react'
import { useClock } from '../hooks/useClock'

export function TerminalHeader({ detonationCount, countryCount }) {
  const time = useClock()
  const headerRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.1 }
    )
    const landing = document.getElementById('landing')
    if (landing) observer.observe(landing)
    return () => observer.disconnect()
  }, [])

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full font-mono"
      style={{
        background: 'rgba(10,9,0,0.95)',
        backdropFilter: 'blur(4px)',
        borderBottom: '1px solid rgba(201,168,0,0.25)',
        boxShadow: '0 2px 20px rgba(201,168,0,0.08)',
      }}
    >
      <div className="flex items-center justify-between px-3 md:px-6 h-9 md:h-10">
        {/* Left */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
            style={{ background: '#c9a800', boxShadow: '0 0 6px #c9a800' }}
          />
          <span className="text-terminal-bright text-xs tracking-widest hidden md:block" style={{ textShadow: '0 0 8px rgba(240,204,0,0.4)' }}>
            PROJECT: NUCLEAR_LEDGER
          </span>
          <span className="text-terminal-dim text-xs tracking-widest hidden md:block">//</span>
          <span className="text-terminal-dim text-xs tracking-widest hidden lg:block">STRATEGIC_ANALYSIS</span>
          <span className="text-terminal-bright text-xs tracking-widest block md:hidden" style={{ textShadow: '0 0 8px rgba(240,204,0,0.4)' }}>
            NUCLEAR_LEDGER
          </span>
        </div>

        {/* Center — clock */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="text-terminal-dim text-xs tracking-widest hidden md:block" style={{ fontSize: '0.5rem', letterSpacing: '0.2em' }}>
            SYSTEM_TIME
          </div>
          <div className="text-terminal-bright font-mono text-xs md:text-sm tracking-widest tabular-nums" style={{ textShadow: '0 0 8px rgba(240,204,0,0.3)', minWidth: '10ch', textAlign: 'center' }}>
            {time}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-4 text-xs tracking-widest justify-end">
          <span className="text-terminal-dim hidden sm:block">{detonationCount} EVENTS</span>
          <span className="text-terminal-dimmer hidden md:block">|</span>
          <span className="text-terminal-dim hidden md:block">{countryCount} NATIONS</span>
          <span className="text-terminal-dimmer hidden lg:block">|</span>
          <span className="text-terminal-primary hidden lg:block">V.4.2-STABLE</span>
          <span className="text-terminal-dimmer hidden lg:block">//</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#30c870', boxShadow: '0 0 4px #30c870' }} />
            <span className="text-terminal-dim text-xs">ENCRYPTED</span>
          </div>
        </div>
      </div>
    </header>
  )
}
