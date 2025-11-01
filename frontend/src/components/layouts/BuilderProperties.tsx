import React, { useState } from 'react'
import { cn } from '@/utils'
import { Element } from '@/types'
import toast from 'react-hot-toast'
import { useBuilderStore } from '@/store'
import { useWebsiteStore } from '@/store'

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
  const [localStyles, setLocalStyles] = useState<any>(selectedElement?.styles || {})
  const [breakpoint, setBreakpoint] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const { themeTokens, setThemeToken } = useBuilderStore()
  const { saveThemeTokens } = useBuilderStore()
  const { currentWebsite } = useWebsiteStore()
  const saveDebounce = React.useRef<number | undefined>(undefined)

  React.useEffect(() => {
    if (selectedElement) {
      setLocalProps(selectedElement.props || {})
      // Load styles for current breakpoint
      const bp = breakpoint === 'desktop' ? null : breakpoint
      const baseStyles = selectedElement.styles || {}
      const bpStyles = bp && selectedElement.responsive?.[bp] ? selectedElement.responsive[bp] : {}
      setLocalStyles({ ...baseStyles, ...bpStyles })
    }
  }, [selectedElement, breakpoint])

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
    if (!selectedElement) return
    const updates: Partial<Element> = {}
    
    // Handle props
    if (breakpoint === 'desktop') {
      updates.props = { ...selectedElement.props, ...localProps }
    } else {
      const current = selectedElement.props || {}
      const bps = { ...(current.breakpoints || {}) }
      bps[breakpoint] = { ...(bps[breakpoint] || {}), ...localProps }
      updates.props = { ...current, breakpoints: bps }
    }
    
    // Handle styles per breakpoint
    if (breakpoint === 'desktop') {
      updates.styles = { ...localStyles }
    } else {
      const currentResp = selectedElement.responsive || {}
      const baseStyles = selectedElement.styles || {}
      const bpOverrides = { ...localStyles }
      // Remove base styles to get only overrides
      Object.keys(baseStyles).forEach(key => {
        if (bpOverrides[key] === baseStyles[key]) {
          delete bpOverrides[key]
        }
      })
      updates.responsive = {
        ...currentResp,
        [breakpoint]: bpOverrides
      }
    }
    
    onUpdateElement(selectedElement.id, updates)
    toast.success('Element updated')
  }
  
  // Check if current breakpoint has overrides
  const hasOverrides = React.useMemo(() => {
    if (!selectedElement || breakpoint === 'desktop') return false
    return !!selectedElement.responsive?.[breakpoint]
  }, [selectedElement, breakpoint])
  
  // Check visibility per breakpoint
  const getVisibilityForBreakpoint = (bp: 'desktop' | 'tablet' | 'mobile') => {
    if (!selectedElement) return true
    if (bp === 'desktop') return selectedElement.isVisible !== false
    const vis = (selectedElement.props as any)?.visibility?.[bp]
    return vis !== undefined ? vis : true
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
          {/* Breakpoint tabs with override indicators */}
          <div className="flex items-center gap-2 mb-2">
            {(['desktop','tablet','mobile'] as const).map((bp) => {
              const hasBpOverrides = bp !== 'desktop' && (!!selectedElement?.responsive?.[bp] || !!(selectedElement?.props as any)?.breakpoints?.[bp])
              return (
                <button
                  key={bp}
                  onClick={() => setBreakpoint(bp)}
                  className={cn('px-2 py-1 text-xs rounded border relative', 
                    breakpoint===bp ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-100 text-gray-600 border-transparent hover:bg-white',
                    hasBpOverrides && 'pr-6'
                  )}
                >
                  {bp}
                  {hasBpOverrides && (
                    <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-orange-500 rounded-full" title="Has overrides" />
                  )}
                </button>
              )
            })}
            {selectedElement && breakpoint !== 'desktop' && hasOverrides && (
              <button
                className="ml-auto px-2 py-1 text-xs rounded border bg-orange-50 text-orange-700 hover:bg-orange-100"
                title="Clear overrides for this breakpoint"
                onClick={() => {
                  const currentResp = selectedElement.responsive || {}
                  const newResp = { ...currentResp }
                  delete newResp[breakpoint]
                  onUpdateElement(selectedElement.id, { 
                    responsive: newResp,
                    props: {
                      ...selectedElement.props,
                      breakpoints: {
                        ...((selectedElement.props as any)?.breakpoints || {}),
                        [breakpoint]: undefined
                      }
                    } as any
                  })
                  // Reset local state
                  setLocalStyles(selectedElement.styles || {})
                  toast.success('Cleared breakpoint overrides')
                }}
              >Reset {breakpoint}</button>
            )}
          </div>
          
          {/* Visibility toggles per breakpoint */}
          {selectedElement && (
            <div className="p-2 bg-white rounded border border-gray-200 mb-2">
              <div className="text-xs font-semibold text-gray-600 mb-2">Visibility</div>
              <div className="flex items-center gap-3">
                {(['desktop','tablet','mobile'] as const).map((bp) => (
                  <label key={bp} className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={getVisibilityForBreakpoint(bp)}
                      onChange={(e) => {
                        if (bp === 'desktop') {
                          onUpdateElement(selectedElement.id, { isVisible: e.target.checked })
                        } else {
                          const vis = (selectedElement.props as any)?.visibility || {}
                          onUpdateElement(selectedElement.id, {
                            props: { ...selectedElement.props, visibility: { ...vis, [bp]: e.target.checked } } as any
                          })
                        }
                      }}
                      className="w-3 h-3"
                    />
                    <span className="text-gray-700 capitalize">{bp}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Style Editor Section */}
          {selectedElement && (
            <div className="p-2 bg-white rounded border border-gray-200 mb-2">
              <div className="text-xs font-semibold text-gray-600 mb-2">
                Styles {breakpoint !== 'desktop' && <span className="text-orange-600">({breakpoint} overrides)</span>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex flex-col gap-1">
                  <span className="text-gray-600">Width</span>
                  <input
                    type="text"
                    value={localStyles.width || ''}
                    onChange={(e) => setLocalStyles({ ...localStyles, width: e.target.value })}
                    className="border px-1 py-0.5 rounded text-xs"
                    placeholder="auto"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-gray-600">Height</span>
                  <input
                    type="text"
                    value={localStyles.height || ''}
                    onChange={(e) => setLocalStyles({ ...localStyles, height: e.target.value })}
                    className="border px-1 py-0.5 rounded text-xs"
                    placeholder="auto"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-gray-600">Padding</span>
                  <input
                    type="text"
                    value={localStyles.padding || ''}
                    onChange={(e) => setLocalStyles({ ...localStyles, padding: e.target.value })}
                    className="border px-1 py-0.5 rounded text-xs"
                    placeholder="0"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-gray-600">Margin</span>
                  <input
                    type="text"
                    value={localStyles.margin || ''}
                    onChange={(e) => setLocalStyles({ ...localStyles, margin: e.target.value })}
                    className="border px-1 py-0.5 rounded text-xs"
                    placeholder="0"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-gray-600">Background</span>
                  <input
                    type="text"
                    value={localStyles.backgroundColor || ''}
                    onChange={(e) => setLocalStyles({ ...localStyles, backgroundColor: e.target.value })}
                    className="border px-1 py-0.5 rounded text-xs"
                    placeholder="#fff"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-gray-600">Border Radius</span>
                  <input
                    type="text"
                    value={localStyles.borderRadius || ''}
                    onChange={(e) => setLocalStyles({ ...localStyles, borderRadius: e.target.value })}
                    className="border px-1 py-0.5 rounded text-xs"
                    placeholder="0"
                  />
                </label>
              </div>
              <button
                onClick={handleUpdate}
                className="mt-2 w-full px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply Styles
              </button>
            </div>
          )}

          {/* Theme tokens */}
          <div className="p-2 bg-white rounded border border-gray-200">
            <div className="text-xs font-semibold text-gray-600 mb-2">Theme Tokens</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center justify-between gap-2">Primary<input type="color" value={themeTokens.colors.primary} onChange={(e)=>{ setThemeToken('colors.primary', e.target.value); if(currentWebsite){ if(saveDebounce.current) window.clearTimeout(saveDebounce.current); saveDebounce.current = window.setTimeout(()=>saveThemeTokens(currentWebsite.id), 400) } }} /></label>
              <label className="flex items-center justify-between gap-2">Secondary<input type="color" value={themeTokens.colors.secondary} onChange={(e)=>{ setThemeToken('colors.secondary', e.target.value); if(currentWebsite){ if(saveDebounce.current) window.clearTimeout(saveDebounce.current); saveDebounce.current = window.setTimeout(()=>saveThemeTokens(currentWebsite.id), 400) } }} /></label>
              <label className="flex items-center justify-between gap-2">Text<input type="color" value={themeTokens.colors.text} onChange={(e)=>{ setThemeToken('colors.text', e.target.value); if(currentWebsite){ if(saveDebounce.current) window.clearTimeout(saveDebounce.current); saveDebounce.current = window.setTimeout(()=>saveThemeTokens(currentWebsite.id), 400) } }} /></label>
              <label className="flex items-center justify-between gap-2">Background<input type="color" value={themeTokens.colors.background} onChange={(e)=>{ setThemeToken('colors.background', e.target.value); if(currentWebsite){ if(saveDebounce.current) window.clearTimeout(saveDebounce.current); saveDebounce.current = window.setTimeout(()=>saveThemeTokens(currentWebsite.id), 400) } }} /></label>
            </div>
            {selectedElement && (
              <div className="mt-2 flex items-center gap-2">
                <button className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50" onClick={()=> onUpdateElement(selectedElement.id, { styles: { ...(selectedElement.styles||{}), color: 'token:colors.text' } as any })}>Apply Text</button>
                <button className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50" onClick={()=> onUpdateElement(selectedElement.id, { styles: { ...(selectedElement.styles||{}), backgroundColor: 'token:colors.background' } as any })}>Apply Background</button>
              </div>
            )}
            <div className="mt-2">
              <button
                className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50"
                onClick={()=>{ if(currentWebsite){ saveThemeTokens(currentWebsite.id); toast.success('Theme saved') } }}
              >Save Theme</button>
            </div>
          </div>

          {/* Typography & Spacing tokens */}
          <div className="p-2 bg-white rounded border border-gray-200">
            <div className="text-xs font-semibold text-gray-600 mb-2">Typography & Spacing</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center justify-between gap-2">Font Family
                <input type="text" value={themeTokens.typography.fontFamily} onChange={(e)=>{ setThemeToken('typography.fontFamily', e.target.value); if(currentWebsite){ if(saveDebounce.current) window.clearTimeout(saveDebounce.current); saveDebounce.current = window.setTimeout(()=>saveThemeTokens(currentWebsite.id), 400) } }} className="border px-1 py-0.5 rounded text-xs" />
              </label>
              <label className="flex items-center justify-between gap-2">Base Size
                <input type="number" value={themeTokens.typography.baseSize} onChange={(e)=>{ setThemeToken('typography.baseSize', parseInt(e.target.value)||16); if(currentWebsite){ if(saveDebounce.current) window.clearTimeout(saveDebounce.current); saveDebounce.current = window.setTimeout(()=>saveThemeTokens(currentWebsite.id), 400) } }} className="border px-1 py-0.5 rounded text-xs w-16" />
              </label>
              <label className="flex items-center justify-between gap-2">Spacing Base
                <input type="number" value={themeTokens.spacing.base} onChange={(e)=>{ setThemeToken('spacing.base', parseInt(e.target.value)||8); if(currentWebsite){ if(saveDebounce.current) window.clearTimeout(saveDebounce.current); saveDebounce.current = window.setTimeout(()=>saveThemeTokens(currentWebsite.id), 400) } }} className="border px-1 py-0.5 rounded text-xs w-16" />
              </label>
              <label className="flex items-center justify-between gap-2">Radius
                <input type="number" value={themeTokens.spacing.radius} onChange={(e)=>{ setThemeToken('spacing.radius', parseInt(e.target.value)||8); if(currentWebsite){ if(saveDebounce.current) window.clearTimeout(saveDebounce.current); saveDebounce.current = window.setTimeout(()=>saveThemeTokens(currentWebsite.id), 400) } }} className="border px-1 py-0.5 rounded text-xs w-16" />
              </label>
            </div>
            {selectedElement && (
              <div className="mt-2 flex items-center gap-2">
                <button className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50" onClick={()=> onUpdateElement(selectedElement.id, { styles: { ...(selectedElement.styles||{}), fontFamily: 'token:typography.fontFamily', fontSize: 'token:typography.baseSize' } as any })}>Apply Typography</button>
                <button className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50" onClick={()=> onUpdateElement(selectedElement.id, { styles: { ...(selectedElement.styles||{}), padding: 'token:spacing.base', borderRadius: 'token:spacing.radius' } as any })}>Apply Spacing</button>
              </div>
            )}
          </div>
          {/* Style Presets */}
          {selectedElement && ['BUTTON', 'CARD', 'INPUT'].includes(selectedElement.type) && (
            <div className="p-2 bg-white rounded border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-2">Style Presets</div>
              <div className="space-y-2">
                {selectedElement.type === 'BUTTON' && (
                  <>
                    <button
                      className="w-full px-2 py-1.5 text-xs rounded border bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => {
                        onUpdateElement(selectedElement.id, {
                          styles: {
                            ...selectedElement.styles,
                            backgroundColor: themeTokens.colors.primary,
                            color: '#ffffff',
                            padding: '12px 24px',
                            borderRadius: `${themeTokens.spacing.radius}px`,
                            border: 'none',
                            cursor: 'pointer',
                          } as any
                        })
                        toast.success('Applied button preset')
                      }}
                    >
                      Apply Primary Button
                    </button>
                    <button
                      className="w-full px-2 py-1.5 text-xs rounded border bg-gray-200 text-gray-800 hover:bg-gray-300"
                      onClick={() => {
                        onUpdateElement(selectedElement.id, {
                          styles: {
                            ...selectedElement.styles,
                            backgroundColor: '#e5e7eb',
                            color: '#1f2937',
                            padding: '12px 24px',
                            borderRadius: `${themeTokens.spacing.radius}px`,
                            border: 'none',
                            cursor: 'pointer',
                          } as any
                        })
                        toast.success('Applied secondary button preset')
                      }}
                    >
                      Apply Secondary Button
                    </button>
                  </>
                )}
                {selectedElement.type === 'CARD' && (
                  <button
                    className="w-full px-2 py-1.5 text-xs rounded border bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                    onClick={() => {
                      onUpdateElement(selectedElement.id, {
                        styles: {
                          ...selectedElement.styles,
                          backgroundColor: '#ffffff',
                          padding: `${themeTokens.spacing.base}px`,
                          borderRadius: `${themeTokens.spacing.radius}px`,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        } as any
                      })
                      toast.success('Applied card preset')
                    }}
                  >
                    Apply Card Preset
                  </button>
                )}
                {selectedElement.type === 'INPUT' && (
                  <button
                    className="w-full px-2 py-1.5 text-xs rounded border bg-white text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      onUpdateElement(selectedElement.id, {
                        styles: {
                          ...selectedElement.styles,
                          border: '1px solid #d1d5db',
                          borderRadius: `${themeTokens.spacing.radius}px`,
                          padding: '8px 12px',
                          fontSize: themeTokens.typography.baseSize,
                        } as any
                      })
                      toast.success('Applied input preset')
                    }}
                  >
                    Apply Input Preset
                  </button>
                )}
              </div>
            </div>
          )}
          
          <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">Element Type</span>
              <span className="text-xs font-semibold text-blue-700 uppercase">{selectedElement.type}</span>
            </div>
          </div>
        
                 {/* Phase 3: Data Binding */}
                 {selectedElement && (
                   <div className="p-2 bg-white rounded border border-gray-200">
                     <div className="text-xs font-semibold text-gray-600 mb-2">📊 Data Binding</div>
                     <div className="space-y-2">
                       <label className="flex flex-col gap-1">
                         <span className="text-xs text-gray-600">Data Source</span>
                         <select
                           value={(selectedElement.dataSource?.type || 'none')}
                           onChange={(e) => {
                             const type = e.target.value as any
                             onUpdateElement(selectedElement.id, {
                               dataSource: type === 'none' ? undefined : { type, filter: {}, limit: 10 }
                             })
                           }}
                           className="border px-2 py-1 rounded text-xs"
                         >
                           <option value="none">None</option>
                           <option value="products">Products</option>
                           <option value="blog">Blog Posts</option>
                           <option value="services">Services</option>
                           <option value="custom">Custom</option>
                         </select>
                       </label>
                       {selectedElement.dataSource && (
                         <>
                           {/* Pagination Controls */}
                           <div className="grid grid-cols-2 gap-2">
                             <label className="flex flex-col gap-1">
                               <span className="text-xs text-gray-600">Page</span>
                               <input
                                 type="number"
                                 value={selectedElement.dataSource.page || 1}
                                 onChange={(e) => {
                                   onUpdateElement(selectedElement.id, {
                                     dataSource: {
                                       ...selectedElement.dataSource,
                                       page: Number(e.target.value) || 1
                                     }
                                   })
                                 }}
                                 className="border px-2 py-1 rounded text-xs"
                               />
                             </label>
                             <label className="flex flex-col gap-1">
                               <span className="text-xs text-gray-600">Page Size</span>
                               <input
                                 type="number"
                                 value={selectedElement.dataSource.pageSize || 10}
                                 onChange={(e) => {
                                   onUpdateElement(selectedElement.id, {
                                     dataSource: {
                                       ...selectedElement.dataSource,
                                       pageSize: Number(e.target.value) || 10
                                     }
                                   })
                                 }}
                                 className="border px-2 py-1 rounded text-xs"
                               />
                             </label>
                           </div>
                           <label className="flex flex-col gap-1">
                             <span className="text-xs text-gray-600">Limit</span>
                             <input
                               type="number"
                               value={selectedElement.dataSource.limit || 10}
                               onChange={(e) => {
                                 onUpdateElement(selectedElement.id, {
                                   dataSource: {
                                     ...selectedElement.dataSource,
                                     limit: parseInt(e.target.value) || 10
                                   }
                                 })
                               }}
                               className="border px-2 py-1 rounded text-xs"
                             />
                           </label>
                           <div className="flex flex-col gap-1">
                             <span className="text-xs text-gray-600">Bindings (e.g., text: {'{{product.name}}'})</span>
                             <textarea
                               value={JSON.stringify(selectedElement.dataBindings || {}, null, 2)}
                               onChange={(e) => {
                                 try {
                                   const bindings = JSON.parse(e.target.value)
                                   onUpdateElement(selectedElement.id, { dataBindings: bindings })
                                 } catch {}
                               }}
                               placeholder='{ "text": "{{product.name}}", "image": "{{product.image}}" }'
                               className="border px-2 py-1 rounded text-xs font-mono text-[10px] h-20"
                             />
                           </div>
                         </>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Phase 3: Conditional Rendering */}
                 {selectedElement && (
                   <div className="p-2 bg-white rounded border border-gray-200">
                     <div className="text-xs font-semibold text-gray-600 mb-2">🔀 Conditional Rendering</div>
                     <div className="space-y-2">
                       <label className="flex flex-col gap-1">
                         <span className="text-xs text-gray-600">Field</span>
                         <input
                           type="text"
                           value={selectedElement.condition?.field || ''}
                           onChange={(e) => {
                             const field = e.target.value
                             if (!field) {
                               onUpdateElement(selectedElement.id, { condition: undefined })
                             } else {
                               onUpdateElement(selectedElement.id, {
                                 condition: {
                                   field,
                                   operator: selectedElement.condition?.operator || 'eq',
                                   value: selectedElement.condition?.value || ''
                                 }
                               })
                             }
                           }}
                           placeholder="e.g., product.price"
                           className="border px-2 py-1 rounded text-xs"
                         />
                       </label>
                       {selectedElement.condition && (
                         <>
                           <label className="flex flex-col gap-1">
                             <span className="text-xs text-gray-600">Operator</span>
                             <select
                               value={selectedElement.condition.operator}
                               onChange={(e) => {
                                 onUpdateElement(selectedElement.id, {
                                   condition: {
                                     ...selectedElement.condition,
                                     operator: e.target.value as any
                                   }
                                 })
                               }}
                               className="border px-2 py-1 rounded text-xs"
                             >
                               <option value="eq">Equals</option>
                               <option value="ne">Not Equals</option>
                               <option value="gt">Greater Than</option>
                               <option value="gte">Greater or Equal</option>
                               <option value="lt">Less Than</option>
                               <option value="lte">Less or Equal</option>
                               <option value="contains">Contains</option>
                               <option value="exists">Exists</option>
                             </select>
                           </label>
                           <label className="flex flex-col gap-1">
                             <span className="text-xs text-gray-600">Value</span>
                             <input
                               type="text"
                               value={selectedElement.condition.value || ''}
                               onChange={(e) => {
                                 onUpdateElement(selectedElement.id, {
                                   condition: {
                                     ...selectedElement.condition,
                                     value: e.target.value
                                   }
                                 })
                               }}
                               className="border px-2 py-1 rounded text-xs"
                             />
                           </label>
                         </>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Phase 3: Animations */}
                 {selectedElement && (
                   <div className="p-2 bg-white rounded border border-gray-200">
                     <div className="text-xs font-semibold text-gray-600 mb-2">✨ Animations</div>
                     <div className="space-y-2">
                       <label className="flex flex-col gap-1">
                         <span className="text-xs text-gray-600">Entrance</span>
                         <select
                           value={selectedElement.animations?.entrance || 'none'}
                           onChange={(e) => {
                             onUpdateElement(selectedElement.id, {
                               animations: {
                                 ...selectedElement.animations,
                                 entrance: (e.target.value === 'none' ? undefined : e.target.value) as any
                               }
                             })
                           }}
                           className="border px-2 py-1 rounded text-xs"
                         >
                           <option value="none">None</option>
                           <option value="fade">Fade In</option>
                           <option value="slide">Slide In</option>
                           <option value="zoom">Zoom In</option>
                           <option value="bounce">Bounce In</option>
                         </select>
                       </label>
                       {selectedElement.animations?.entrance && (
                         <label className="flex flex-col gap-1">
                           <span className="text-xs text-gray-600">Delay (ms)</span>
                           <input
                             type="number"
                             value={selectedElement.animations?.delay || 0}
                             onChange={(e) => {
                               onUpdateElement(selectedElement.id, {
                                 animations: {
                                   ...selectedElement.animations,
                                   delay: parseInt(e.target.value) || 0
                                 }
                               })
                             }}
                             className="border px-2 py-1 rounded text-xs"
                           />
                         </label>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Phase 3: Interactions */}
                 {selectedElement && (
                   <div className="p-2 bg-white rounded border border-gray-200">
                     <div className="text-xs font-semibold text-gray-600 mb-2">🎯 Interactions</div>
                     <div className="space-y-2">
                       <label className="flex flex-col gap-1">
                         <span className="text-xs text-gray-600">On Click</span>
                         <select
                           value={selectedElement.interactions?.onClick?.type || 'none'}
                           onChange={(e) => {
                             const type = e.target.value
                             if (type === 'none') {
                               const next = { ...selectedElement.interactions }
                               delete next.onClick
                               onUpdateElement(selectedElement.id, { interactions: Object.keys(next).length > 0 ? next : undefined })
                             } else {
                               onUpdateElement(selectedElement.id, {
                                 interactions: {
                                   ...selectedElement.interactions,
                                   onClick: { type: type as any, target: '', action: '' }
                                 }
                               })
                             }
                           }}
                           className="border px-2 py-1 rounded text-xs"
                         >
                           <option value="none">None</option>
                           <option value="navigate">Navigate</option>
                           <option value="modal">Open Modal</option>
                           <option value="toggle">Toggle Element</option>
                           <option value="custom">Custom JS</option>
                         </select>
                       </label>
                       {selectedElement.interactions?.onClick && (
                         <>
                           <label className="flex flex-col gap-1">
                             <span className="text-xs text-gray-600">Target</span>
                             <input
                               type="text"
                               value={selectedElement.interactions.onClick.target || ''}
                               onChange={(e) => {
                                 onUpdateElement(selectedElement.id, {
                                   interactions: {
                                     ...selectedElement.interactions,
                                     onClick: {
                                       ...selectedElement.interactions.onClick,
                                       target: e.target.value
                                     }
                                   }
                                 })
                               }}
                               placeholder="/page or element-id"
                               className="border px-2 py-1 rounded text-xs"
                             />
                           </label>
                           {selectedElement.interactions.onClick.type === 'custom' && (
                             <label className="flex flex-col gap-1">
                               <span className="text-xs text-gray-600">Custom JS</span>
                               <textarea
                                 value={selectedElement.interactions.onClick.action || ''}
                                 onChange={(e) => {
                                   onUpdateElement(selectedElement.id, {
                                     interactions: {
                                       ...selectedElement.interactions,
                                       onClick: {
                                         ...selectedElement.interactions.onClick,
                                         action: e.target.value
                                       }
                                     }
                                   })
                                 }}
                                 placeholder="console.log('clicked')"
                                 className="border px-2 py-1 rounded text-xs font-mono text-[10px] h-16"
                               />
                             </label>
                           )}
                         </>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Phase 3: Code Editor */}
                 {selectedElement && (
                   <div className="p-2 bg-white rounded border border-gray-200">
                     <div className="text-xs font-semibold text-gray-600 mb-2">💻 Custom Code</div>
                     <div className="space-y-2">
                       <label className="flex flex-col gap-1">
                         <span className="text-xs text-gray-600">Custom CSS</span>
                         <textarea
                           value={selectedElement.customCSS || ''}
                           onChange={(e) => {
                             onUpdateElement(selectedElement.id, { customCSS: e.target.value || undefined })
                           }}
                           placeholder="background: linear-gradient(...);"
                           className="border px-2 py-1 rounded text-xs font-mono text-[10px] h-20"
                         />
                       </label>
                       <label className="flex flex-col gap-1">
                         <span className="text-xs text-gray-600">Custom JS</span>
                         <textarea
                           value={selectedElement.customJS || ''}
                           onChange={(e) => {
                             onUpdateElement(selectedElement.id, { customJS: e.target.value || undefined })
                           }}
                           placeholder="console.log('Hello');"
                           className="border px-2 py-1 rounded text-xs font-mono text-[10px] h-20"
                         />
                       </label>
                     </div>
                   </div>
                 )}

                 {/* Element-Specific Properties */}
          {/* Component/Variant helpers */}
          {selectedElement && (
            <div className="p-2 bg-white rounded border border-gray-200">
              <div className="text-xs font-semibold text-gray-600 mb-2">Component & Variants</div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs text-gray-600">Variant</label>
                <input
                  type="text"
                  value={localProps.variantName || ''}
                  onChange={(e)=> setLocalProps({ ...localProps, variantName: e.target.value })}
                  className="border px-2 py-1 rounded text-xs"
                  placeholder="e.g. primary, large"
                />
                <button className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50" onClick={handleUpdate}>Apply</button>
                {(selectedElement.props as any)?.componentBase && (
                  <>
                    <button
                      className="ml-auto px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50"
                      onClick={()=>{
                        // Signal reset via styles/props set; store has reset method, but we can approximate by clearing to base here
                        const base: any = (selectedElement.props as any).componentBase
                        if (base) {
                          onUpdateElement(selectedElement.id, { props: { ...(selectedElement.props||{}), ...(base.props||{}) }, styles: base.styles as any })
                          toast.success('Reset to component defaults')
                        }
                      }}
                    >Reset to Defaults</button>
                    <div className="mt-2 text-[10px] text-gray-500">
                      <div className="font-semibold mb-1">Override Diff:</div>
                      {(() => {
                        const base: any = (selectedElement.props as any).componentBase || {}
                        const baseStyles = base.styles || {}
                        const currentStyles = selectedElement.styles || {}
                        const diffProps = Object.keys(selectedElement.props || {}).filter(k => k !== 'componentBase' && selectedElement.props?.[k] !== base.props?.[k])
                        const diffStyles = Object.keys(currentStyles).filter(k => currentStyles[k] !== baseStyles[k])
                        if (diffProps.length === 0 && diffStyles.length === 0) return <span className="text-green-600">No overrides</span>
                        return (
                          <div>
                            {diffProps.length > 0 && <div className="text-orange-600">Props: {diffProps.join(', ')}</div>}
                            {diffStyles.length > 0 && <div className="text-orange-600">Styles: {diffStyles.slice(0, 3).join(', ')}{diffStyles.length > 3 ? ` +${diffStyles.length - 3}` : ''}</div>}
                          </div>
                        )
                      })()}
                    </div>
                  </>
                )}
              </div>
              {/* Variant Presets Editor */}
              <div className="mt-2">
                <div className="text-xs font-semibold text-gray-600 mb-2">Variant Presets</div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Variant name"
                    className="border px-2 py-1 rounded text-xs"
                    onKeyDown={(e)=>{
                      if(e.key==='Enter'){
                        const name = (e.target as HTMLInputElement).value.trim()
                        if(!name){ toast.error('Enter a variant name'); return }
                        const baseStyles = selectedElement.styles || {}
                        const diff: any = { ...localStyles }
                        Object.keys(baseStyles).forEach(k => { if (diff[k] === baseStyles[k]) delete diff[k] })
                        const variants = { ...((selectedElement.styles as any)?.variants || {}) }
                        variants[name] = diff
                        onUpdateElement(selectedElement.id, { styles: { ...selectedElement.styles, variants } as any })
                        ;(e.target as HTMLInputElement).value = ''
                        toast.success('Variant saved')
                      }
                    }}
                  />
                  <span className="text-[10px] text-gray-500">Press Enter to save</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(((selectedElement.styles as any)?.variants || {})).map(([name]) => (
                    <div key={name} className="flex items-center gap-1 text-xs px-2 py-1 border rounded bg-gray-50">
                      <button
                        className="text-gray-700 hover:text-blue-700"
                        title={`Use ${name}`}
                        onClick={()=>{
                          setLocalProps({ ...localProps, variantName: name })
                          handleUpdate()
                        }}
                      >{name}</button>
                      <button
                        className="text-red-600 hover:text-red-700"
                        title="Delete variant"
                        onClick={()=>{
                          const variants = { ...((selectedElement.styles as any)?.variants || {}) }
                          delete variants[name]
                          onUpdateElement(selectedElement.id, { styles: { ...selectedElement.styles, variants } as any })
                          toast.success('Variant deleted')
                        }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
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
