import { useEffect } from 'react'

export interface ToastMsg {
  id: number
  text: string
  tone: 'ok' | 'err' | 'info'
}

export function Toasts({ toasts }: { toasts: ToastMsg[] }) {
  if (toasts.length === 0) return null
  return (
    <div className="pointer-events-none fixed top-4 right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 ${
            t.tone === 'err'
              ? 'border border-red-200 bg-red-50 text-red-800'
              : t.tone === 'ok'
                ? 'border border-green-200 bg-green-50 text-green-800'
                : 'border border-[#E8E2DA] bg-white text-[#2D2A26]'
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  )
}

export function useToastTimeout(toasts: ToastMsg[], setToasts: (fn: (t: ToastMsg[]) => ToastMsg[]) => void) {
  useEffect(() => {
    if (toasts.length === 0) return
    const id = window.setTimeout(() => setToasts((t) => t.slice(1)), 3200)
    return () => window.clearTimeout(id)
  }, [toasts, setToasts])
}
