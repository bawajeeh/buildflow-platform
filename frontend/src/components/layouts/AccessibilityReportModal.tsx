import React from 'react'
import { Page, Element } from '@/types'

interface Issue {
  id: string
  elementId?: string
  severity: 'error' | 'warn'
  message: string
}

interface Props {
  page: Page | null
  isOpen: boolean
  onClose: () => void
}

const AccessibilityReportModal: React.FC<Props> = ({ page, isOpen, onClose }) => {
  if (!isOpen) return null

  const issues = auditPage(page)

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Accessibility Report</h3>
          <button className="text-gray-500 hover:text-gray-900" onClick={onClose}>✕</button>
        </div>
        {issues.length === 0 ? (
          <div className="py-10 text-center text-green-700">No issues detected</div>
        ) : (
          <ul className="space-y-2 max-h-96 overflow-auto">
            {issues.map((i) => (
              <li key={i.id} className={`border rounded p-3 ${i.severity==='error' ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'}`}>
                <div className="text-sm text-gray-900">
                  <span className={`mr-2 text-xs px-2 py-0.5 rounded ${i.severity==='error' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'}`}>{i.severity.toUpperCase()}</span>
                  {i.message}
                  {i.elementId ? <span className="ml-2 text-xs text-gray-500">(el: {i.elementId})</span> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function auditPage(page: Page | null): Issue[] {
  if (!page) return []
  const issues: Issue[] = []
  const elements = (page.elements || []) as unknown as Element[]
  // Track heading order
  let lastHeadingLevel = 0
  for (const el of elements) {
    const t = String((el as any).type || '').toUpperCase()
    const props = (el as any).props || {}
    if (t === 'IMAGE') {
      const alt = props.alt
      if (alt === undefined || alt === null || String(alt).trim() === '') {
        issues.push({ id: `img-alt-${el.id}`, elementId: el.id, severity: 'error', message: 'Image missing alt text' })
      }
    }
    if (t === 'BUTTON') {
      const text = props.text
      if (text === undefined || text === null || String(text).trim() === '') {
        issues.push({ id: `btn-text-${el.id}`, elementId: el.id, severity: 'error', message: 'Button missing accessible name/text' })
      }
    }
    if (t === 'HEADING') {
      const level = Math.min(Math.max(Number(props.level) || 1, 1), 6)
      if (lastHeadingLevel !== 0 && level - lastHeadingLevel > 1) {
        issues.push({ id: `heading-order-${el.id}`, elementId: el.id, severity: 'warn', message: `Heading level jumps from h${lastHeadingLevel} to h${level}` })
      }
      lastHeadingLevel = level
    }
  }
  return issues
}

export default AccessibilityReportModal


