import React, { useState } from 'react'
import { Page, Element } from '@/types'
import { useCommentsStore } from '@/store/comments'

interface Props {
  page: Page | null
  selectedElement: Element | null
  isOpen: boolean
  onClose: () => void
}

const CommentsModal: React.FC<Props> = ({ page, selectedElement, isOpen, onClose }) => {
  const [text, setText] = useState('')
  const addComment = useCommentsStore((s) => s.addComment)
  const resolveComment = useCommentsStore((s) => s.resolveComment)
  const deleteComment = useCommentsStore((s) => s.deleteComment)
  const list = useCommentsStore((s) => s.list)

  if (!isOpen || !page) return null

  const comments = list(page.id)

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Comments</h3>
          <button className="text-gray-500 hover:text-gray-900" onClick={onClose}>✕</button>
        </div>
        <div className="mb-3">
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={3}
            placeholder={selectedElement ? `Comment on: ${selectedElement.name}` : 'Write a comment'}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-2 text-right">
            <button
              className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
              disabled={!text.trim()}
              onClick={() => {
                if (!page) return
                addComment(page.id, { elementId: selectedElement?.id, text: text.trim() })
                setText('')
              }}
            >
              Add
            </button>
          </div>
        </div>
        <div className="space-y-2 max-h-96 overflow-auto">
          {comments.length === 0 ? (
            <div className="text-gray-500 text-sm">No comments yet.</div>
          ) : comments.map((c) => (
            <div key={c.id} className="border rounded p-3">
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>{new Date(c.createdAt).toLocaleString()} {c.elementId ? `• el:${c.elementId}` : ''}</span>
                {c.resolved && <span className="text-green-700">Resolved</span>}
              </div>
              <div className="text-sm text-gray-900 mt-1">{c.text}</div>
              <div className="mt-2 flex items-center gap-2">
                {!c.resolved && (
                  <button className="px-2 py-1 text-xs rounded border" onClick={() => resolveComment(page.id, c.id)}>Resolve</button>
                )}
                <button className="px-2 py-1 text-xs rounded border" onClick={() => deleteComment(page.id, c.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CommentsModal


