import React, { useState } from 'react'
import { cn } from '@/utils'

interface Color {
  name: string
  value: string
}

interface Font {
  name: string
  value: string
}

const BuilderThemePanel: React.FC<{ className?: string }> = ({ className }) => {
  const [primaryColor, setPrimaryColor] = useState('#3B82F6')
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6')
  const [accentColor, setAccentColor] = useState('#10B981')
  const [fontFamily, setFontFamily] = useState('Inter')

  const colors: Color[] = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
  ]

  const fonts: Font[] = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Open Sans', value: 'Open Sans' },
    { name: 'Poppins', value: 'Poppins' },
    { name: 'Montserrat', value: 'Montserrat' },
    { name: 'Playfair Display', value: 'Playfair Display' },
  ]

  return (
    <div className={cn('w-80 bg-white border-l border-gray-200 overflow-y-auto', className)}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          🎨 Theme Customization
        </h3>
        <p className="text-xs text-gray-500">
          Customize your website's theme
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Primary Color */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-3">
            Primary Color
          </label>
          <div className="flex items-center space-x-2 mb-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md font-mono"
            />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => setPrimaryColor(color.value)}
                className="w-full h-10 rounded border-2 transition-all"
                style={{
                  backgroundColor: color.value,
                  borderColor: primaryColor === color.value ? primaryColor : 'transparent',
                }}
              />
            ))}
          </div>
        </div>

        {/* Secondary Color */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-3">
            Secondary Color
          </label>
          <div className="flex items-center space-x-2 mb-3">
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md font-mono"
            />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSecondaryColor(color.value)}
                className="w-full h-10 rounded border-2 transition-all"
                style={{
                  backgroundColor: color.value,
                  borderColor: secondaryColor === color.value ? secondaryColor : 'transparent',
                }}
              />
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-3">
            Font Family
          </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {fonts.map((font) => (
              <option key={font.value} value={font.value}>
                {font.name}
              </option>
            ))}
          </select>
          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm" style={{ fontFamily }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>

        {/* Live Preview */}
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg">
          <div className="text-xs font-semibold text-gray-600 mb-3">Live Preview</div>
          <div className="space-y-2">
            <button
              className="w-full py-2 px-4 rounded text-white font-semibold"
              style={{ backgroundColor: primaryColor }}
            >
              Primary Button
            </button>
            <button
              className="w-full py-2 px-4 rounded text-white font-semibold"
              style={{ backgroundColor: secondaryColor }}
            >
              Secondary Button
            </button>
          </div>
        </div>

        {/* Reset Button */}
        <button className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
          🔄 Reset to Default
        </button>
      </div>
    </div>
  )
}

export default BuilderThemePanel

