import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import type { Toast } from '../../types'

interface ToastProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

function toastConfig(type: Toast['type']) {
  switch (type) {
    case 'success': return { color: '#34D399', border: 'rgba(52,211,153,0.4)', bg: 'rgba(52,211,153,0.06)', Icon: CheckCircle2 }
    case 'error': return { color: '#F87171', border: 'rgba(248,113,113,0.4)', bg: 'rgba(248,113,113,0.06)', Icon: AlertTriangle }
    case 'info': return { color: '#A78BFA', border: 'rgba(124,58,237,0.4)', bg: 'rgba(124,58,237,0.06)', Icon: Info }
  }
}

function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const cfg = toastConfig(toast.type)
          const Icon = cfg.Icon
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-sm"
              style={{ background: '#111114', borderColor: cfg.border, borderLeftWidth: 3, borderLeftColor: cfg.color, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: cfg.color }} />
              <p className="flex-1 text-sm text-text-secondary leading-snug">{toast.message}</p>
              <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 w-5 h-5 flex items-center justify-center rounded-md text-text-secondary/40 hover:text-text-secondary hover:bg-surface-2 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default memo(ToastContainer)
