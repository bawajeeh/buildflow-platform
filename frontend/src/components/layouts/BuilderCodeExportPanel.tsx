import React, { useState } from 'react'
import { cn } from '@/utils'
import { Element } from '@/types'

interface BuilderCodeExportPanelProps {
  elements: Element[]
  onExport: (format: string) => void
  className?: string
}

const BuilderCodeExportPanel: React.FC<BuilderCodeExportPanelProps> = ({
  elements,
  onExport,
  className,
}) => {
  const [exportFormat, setExportFormat] = useState('html')
  const [minify, setMinify] = useState(false)
  const [includeStyles, setIncludeStyles] = useState(true)

  const formats = [
    { value: 'html', label: 'HTML', icon: '🌐', description: 'Pure HTML markup' },
    { value: 'react', label: 'React', icon: '⚛️', description: 'React components' },
    { value: 'vue', label: 'Vue', icon: '🟢', description: 'Vue components' },
    { value: 'angular', label: 'Angular', icon: '🅰️', description: 'Angular templates' },
    { value: 'css', label: 'CSS Only', icon: '🎨', description: 'Just styles' },
  ]

  const generateCode = () => {
    onExport(exportFormat)
  }

  return (
    <div className={cn('w-80 bg-white border-l border-gray-200 overflow-y-auto', className)}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          💻 Code Export
        </h3>
        <p className="text-xs text-gray-500">
          Export your design as production-ready code
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Format Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {formats.map((format) => (
              <button
                key={format.value}
                onClick={() => setExportFormat(format.value)}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all text-left',
                  exportFormat === format.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <div className="text-2xl mb-1">{format.icon}</div>
                <div className="text-sm font-semibold text-gray-900">{format.label}</div>
                <div className="text-xs text-gray-500">{format.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Export Options
          </label>
          
          <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={minify}
              onChange={(e) => setMinify(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Minify code</span>
          </label>

          <label className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={includeStyles}
              onChange={(e) => setIncludeStyles(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Include inline styles</span>
          </label>
        </div>

        {/* Preview */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-semibold text-gray-600 mb-2">Preview</div>
          <div className="text-xs text-gray-500 font-mono bg-white p-2 rounded border border-gray-200">
            {elements.length} elements ready to export
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={generateCode}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
        >
          📥 Export {exportFormat.toUpperCase()} Code
        </button>

        {/* Quick Links */}
        <div className="pt-3 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Quick Actions</h4>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors">
              📋 Copy to Clipboard
            </button>
            <button className="w-full px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors">
              💾 Download ZIP
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuilderCodeExportPanel

