import React, { useEffect, useRef } from 'react'
import { useModalStore } from '@/store/modal'

const GlobalModal: React.FC = () => {
  const { isOpen, content, close } = useModalStore()
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const previousActive = document.activeElement as HTMLElement | null
    // Move focus into modal
    setTimeout(() => closeBtnRef.current?.focus(), 0)
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      previousActive?.focus?.()
    }
  }, [isOpen, close])

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center" aria-hidden={false}>
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-2xl max-w-lg w-[90vw] p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Modal"
      >
        <div className="text-sm whitespace-pre-wrap break-words">{content}</div>
        <div className="mt-3 text-right">
          <button ref={closeBtnRef} onClick={close} className="px-3 py-1.5 text-xs rounded bg-gray-800 text-white">Close</button>
        </div>
      </div>
    </div>
  )
}

export default GlobalModal


