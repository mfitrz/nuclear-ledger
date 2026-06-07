import { motion } from 'framer-motion'
import { PANEL_BORDER } from './panelStyles'

export function ZoomBtn({ label, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.88 }}
      style={{
        width: 32,
        height: 32,
        background: 'rgba(8,7,0,0.9)',
        border: PANEL_BORDER,
        color: '#c9a800',
        fontFamily: 'Share Tech Mono, monospace',
        fontSize: 20,
        lineHeight: 1,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {label}
    </motion.button>
  )
}
