import React, { useState, useEffect } from 'react'
import { cn } from '@/utils'
import { useBuilderStore } from '@/store'
import toast from 'react-hot-toast'
import { Element } from '@/types'
import BuilderCanvas from '../builder/BuilderCanvas'

interface ComponentEditorModalProps {
  componentId: string | null
  onClose: () => void
}

const ComponentEditorModal: React.FC<ComponentEditorModalProps> = ({ componentId, onClose }) => {
  const { components, updateComponent } = useBuilderStore()
  const [componentName, setComponentName] = useState('')
  const [tempPage, setTempPage] = useState<any>(null)
  const [tempElements, setTempElements] = useState<Element[]>([])

  useEffect(() => {
    if (!componentId) return
    const comp = components[componentId]
    if (!comp) {
      onClose()
      return
    }
    setComponentName(comp.name)
    const clonedElements = JSON.parse(JSON.stringify(comp.elements || []))
    setTempElements(clonedElements)
    // Create a temporary page for editing
    setTempPage({
      id: `temp-comp-${componentId}`,
      name: `Edit: ${comp.name}`,
      elements: clonedElements,
    })
  }, [componentId, components, onClose])

  // Sync tempPage.elements when tempElements change
  useEffect(() => {
    if (tempPage) {
      setTempPage({ ...tempPage, elements: tempElements })
    }
  }, [tempElements])

  const handleSave = async () => {
    if (!componentId) return
    try {
      await updateComponent(componentId, {
        name: componentName,
        elements: tempElements,
      })
      toast.success('✅ Component saved and pushed to all instances')
      onClose()
    } catch (error) {
      toast.error('Failed to save component')
    }
  }

  if (!componentId || !tempPage) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl w-[90vw] h-[90vh] flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Edit Component: {componentName}</h2>
            <input
              type="text"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              className="px-2 py-1 text-sm rounded border bg-white text-gray-800"
              placeholder="Component name"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold"
            >
              Save & Close
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {tempPage && (
            <div className="h-full overflow-auto bg-gray-50 p-4">
              <div className="space-y-2">
                <div className="text-xs text-gray-600 mb-2">
                  Edit component elements. Changes will apply to all instances when saved.
                </div>
                {tempElements.map((el, idx) => (
                  <div key={el.id} className="p-2 bg-white border rounded flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">{el.name}</div>
                      <div className="text-xs text-gray-500">{el.type}</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                        onClick={() => {
                          const newEls = tempElements.filter((_, i) => i !== idx)
                          setTempElements(newEls)
                        }}
                      >Delete</button>
                    </div>
                  </div>
                ))}
                {tempElements.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Component is empty. Add elements in the main builder first.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ComponentEditorModal

