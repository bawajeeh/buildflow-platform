import React, { useEffect, useState } from 'react'
import { API_CONFIG } from '@/config/api'
import { useAuthStore } from '@/store'
import { useBuilderStore, useWebsiteStore } from '@/store'
import toast from 'react-hot-toast'

interface SnapshotItem {
  id: string
  name: string
  description?: string
  createdAt: string
  pageCount: number
}

interface SnapshotsModalProps {
  websiteId: string
  isOpen: boolean
  onClose: () => void
}

const SnapshotsModal: React.FC<SnapshotsModalProps> = ({ websiteId, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<SnapshotItem[]>([])
  const fetchPages = useBuilderStore((s) => s.fetchPages)
  const currentWebsite = useWebsiteStore((s) => s.currentWebsite)

  useEffect(() => {
    const load = async () => {
      if (!isOpen) return
      try {
        setLoading(true)
        const { token } = useAuthStore.getState()
        const res = await fetch(API_CONFIG.ENDPOINTS.SNAPSHOTS.LIST(websiteId), {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setItems(data)
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load versions')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isOpen, websiteId])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Versions</h3>
          <button className="text-gray-500 hover:text-gray-900" onClick={onClose}>✕</button>
        </div>
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No snapshots yet. Create one with “Snapshot”.</div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-auto">
            {items.map(s => (
              <div key={s.id} className="border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{s.name}</div>
                  <div className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()} • {s.pageCount} page(s)</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 text-sm rounded border bg-white hover:bg-gray-50"
                    onClick={async () => {
                      try {
                        if (!currentWebsite) return
                        if (!confirm('Restore this version? This will overwrite current pages.')) return
                        toast.loading('Restoring version...', { id: 'restore' })
                        const { token } = useAuthStore.getState()
                        const res = await fetch(API_CONFIG.ENDPOINTS.SNAPSHOTS.RESTORE(websiteId, s.id), {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` },
                        })
                        if (!res.ok) throw new Error(await res.text())
                        await fetchPages(websiteId)
                        toast.success('✅ Restored', { id: 'restore' })
                        onClose()
                      } catch (e: any) {
                        toast.error(e?.message || 'Restore failed', { id: 'restore' })
                      }
                    }}
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SnapshotsModal


