import React, { useState } from 'react'
import { cn } from '@/utils'
import { Element } from '@/types'
import toast from 'react-hot-toast'

interface BuilderPropertiesProps {
  selectedElement: Element | null
  onUpdateElement: (elementId: string, updates: Partial<Element>) => void
  onDeleteElement: (elementId: string) => void
  onCopy?: () => void
  onDuplicate?: () => void
  onPaste?: () => void
  className?: string
}

const BuilderProperties: React.FC<BuilderPropertiesProps> = ({ 
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onCopy,
  onDuplicate,
  onPaste,
  className 
}) => {
  const [localProps, setLocalProps] = useState<any>(selectedElement?.props || {})

  React.useEffect(() => {
    if (selectedElement) {
      setLocalProps(selectedElement.props || {})
    }
  }, [selectedElement])

  if (!selectedElement) {
    return (
      <div className={cn('w-80 bg-gradient-to-br from-gray-50 to-white border-l border-gray-300 p-4', className)}>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Properties</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
        </div>
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Select an element</p>
          <p className="text-xs text-gray-500">Click on any element to edit its properties</p>
        </div>
      </div>
    )
  }

  const handleUpdate = () => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, { 
        props: { ...selectedElement.props, ...localProps } 
      })
      toast.success('Element updated')
    }
  }

  const handleDelete = () => {
    if (confirm('Delete this element?')) {
      onDeleteElement(selectedElement.id)
      toast.success('Element deleted')
    }
  }

  return (
    <div className={cn('w-80 bg-gradient-to-br from-gray-50 to-white border-l border-gray-300 overflow-y-auto shadow-lg', className)}>
      <div className="p-4 sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">⚙️ Properties</h3>
          <div className="flex items-center space-x-1">
            {onCopy && (
              <button
                onClick={onCopy}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded transition-all"
                title="Copy (Ctrl+C)"
              >
                📋
              </button>
            )}
            {onDuplicate && (
              <button
                onClick={onDuplicate}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded transition-all"
                title="Duplicate"
              >
                📄
              </button>
            )}
            {onPaste && (
              <button
                onClick={onPaste}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded transition-all"
                title="Paste (Ctrl+V)"
              >
                📥
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-1.5 bg-red-500 hover:bg-red-600 rounded transition-all"
              title="Delete (Del)"
            >
              🗑️
            </button>
          </div>
        </div>
        <div className="mt-2 text-xs text-white/80">
          {selectedElement.type} • {selectedElement.name}
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-3">
          <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Element Type</span>
              <span className="text-xs font-semibold text-blue-700 uppercase">{selectedElement.type}</span>
            </div>
          </div>
        
          {/* Element-Specific Properties */}
          {selectedElement.type === 'TEXT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Content
              </label>
              <textarea
                value={localProps.text || ''}
                onChange={(e) => setLocalProps({ ...localProps, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
              />
              <button
                onClick={handleUpdate}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          )}

          {selectedElement.type === 'HEADING' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heading Text
              </label>
              <input
                type="text"
                value={localProps.text || ''}
                onChange={(e) => setLocalProps({ ...localProps, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                Level
              </label>
              <select
                value={localProps.level || 1}
                onChange={(e) => setLocalProps({ ...localProps, level: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
              </select>
              <button
                onClick={handleUpdate}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          )}

          {selectedElement.type === 'BUTTON' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={localProps.text || ''}
                onChange={(e) => setLocalProps({ ...localProps, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={handleUpdate}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          )}

          {selectedElement.type === 'IMAGE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={localProps.src || ''}
                onChange={(e) => setLocalProps({ ...localProps, src: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="https://..."
              />
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                Alt Text
              </label>
              <input
                type="text"
                value={localProps.alt || ''}
                onChange={(e) => setLocalProps({ ...localProps, alt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={handleUpdate}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          )}

          {selectedElement.type === 'FORM' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form Action
              </label>
              <input
                type="text"
                value={localProps.action || ''}
                onChange={(e) => setLocalProps({ ...localProps, action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="/submit"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                Method
              </label>
              <select
                value={localProps.method || 'POST'}
                onChange={(e) => setLocalProps({ ...localProps, method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
              <button
                onClick={handleUpdate}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          )}

          {selectedElement.type === 'INPUT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Type
              </label>
              <select
                value={localProps.type || 'text'}
                onChange={(e) => setLocalProps({ ...localProps, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="password">Password</option>
                <option value="number">Number</option>
                <option value="tel">Phone</option>
                <option value="url">URL</option>
              </select>
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                Placeholder
              </label>
              <input
                type="text"
                value={localProps.placeholder || ''}
                onChange={(e) => setLocalProps({ ...localProps, placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Enter placeholder..."
              />
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                Name
              </label>
              <input
                type="text"
                value={localProps.name || ''}
                onChange={(e) => setLocalProps({ ...localProps, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="field_name"
              />
              <button
                onClick={handleUpdate}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          )}

          {/* Spacer Element */}
          {selectedElement.type === 'SPACER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                value={localProps.height || 20}
                onChange={(e) => setLocalProps({ ...localProps, height: parseInt(e.target.value) || 20 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={handleUpdate}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          )}

          {/* Divider Element */}
          {selectedElement.type === 'DIVIDER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Style
              </label>
              <select
                value={localProps.style || 'solid'}
                onChange={(e) => setLocalProps({ ...localProps, style: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
              <button
                onClick={handleUpdate}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          )}

          {/* SELECT Element */}
          {selectedElement.type === 'SELECT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (one per line)
              </label>
              <textarea
                value={localProps.options?.join('\n') || ''}
                onChange={(e) => setLocalProps({ ...localProps, options: e.target.value.split('\n').filter(Boolean) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={4}
              />
              <button
                onClick={handleUpdate}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          )}

          {/* TEXTAREA Element */}
          {selectedElement.type === 'TEXTAREA' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={localProps.placeholder || ''}
                onChange={(e) => setLocalProps({ ...localProps, placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                Rows
              </label>
              <input
                type="number"
                value={localProps.rows || 3}
                onChange={(e) => setLocalProps({ ...localProps, rows: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={handleUpdate}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          )}

          {/* CHECKBOX Element */}
          {selectedElement.type === 'CHECKBOX' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                type="text"
                value={localProps.label || ''}
                onChange={(e) => setLocalProps({ ...localProps, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                <input
                  type="checkbox"
                  checked={localProps.checked || false}
                  onChange={(e) => setLocalProps({ ...localProps, checked: e.target.checked })}
                  className="mr-2"
                />
                Checked by default
              </label>
              <button
                onClick={handleUpdate}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          )}

          {/* RADIO Element */}
          {selectedElement.type === 'RADIO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                type="text"
                value={localProps.label || ''}
                onChange={(e) => setLocalProps({ ...localProps, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                <input
                  type="checkbox"
                  checked={localProps.checked || false}
                  onChange={(e) => setLocalProps({ ...localProps, checked: e.target.checked })}
                  className="mr-2"
                />
                Selected by default
              </label>
              <button
                onClick={handleUpdate}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          )}

          {/* Default case for other elements */}
          {!['TEXT', 'HEADING', 'BUTTON', 'IMAGE', 'FORM', 'INPUT', 'SPACER', 'DIVIDER', 'SELECT', 'TEXTAREA', 'CHECKBOX', 'RADIO'].includes(selectedElement.type) && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Element properties coming soon for {selectedElement.type}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BuilderProperties
