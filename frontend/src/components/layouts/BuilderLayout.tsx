import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DragDropProvider } from '@/components/drag-drop/DragDropProvider'
import { useBuilderStore } from '@/store'
import { useWebsiteStore } from '@/store'
import toast from 'react-hot-toast'
import { API_CONFIG } from '@/config/api'
import { useAuthStore } from '@/store'

// Layout Components
import BuilderHeader from './BuilderHeader'
import BuilderSidebar from './BuilderSidebar'
import BuilderCanvas from '../builder/BuilderCanvas'
import BuilderProperties from './BuilderProperties'
import BuilderToolbar from './BuilderToolbar'
import BuilderLayersPanel from './BuilderLayersPanel'
import ComponentEditorModal from './ComponentEditorModal'

// UI Components
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ResponsiveIndicator from '@/components/ui/ResponsiveIndicator'
import GlobalModal from '@/components/ui/GlobalModal'
import SnapshotsModal from './SnapshotsModal'
import AccessibilityReportModal from './AccessibilityReportModal'
import CommentsModal from './CommentsModal'

// Types
import { Element } from '@/types'

const BuilderLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { websiteId } = useParams<{ websiteId: string }>()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true)
  const [isLayersOpen, setIsLayersOpen] = useState(false)
  const [isSnapshotsOpen, setIsSnapshotsOpen] = useState(false)
  const [isA11yOpen, setIsA11yOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [responsiveMode, setResponsiveMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [showRulers, setShowRulers] = useState(true)
  const [isPanning, setIsPanning] = useState(false)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const panStart = React.useRef<{ x: number; y: number; left: number; top: number } | null>(null)

  const { 
    currentPage, 
    selectedElement, 
    isLoading,
    addElement,
    moveElement,
    updateElement,
    deleteElement,
    selectElement,
    fetchPages,
    setCurrentPage,
    createPage,
    duplicateElement,
    copyElement,
    pasteElement,
    undo,
    redo,
    saveLayout,
    loadThemeTokens,
    saveThemeTokens,
    loadComponents,
    loadCMSData,
    editingComponentId,
    editComponent
  } = useBuilderStore()

  const { currentWebsite, websites, setCurrentWebsite, fetchWebsites } = useWebsiteStore()
  const { setLocale, currentLocale } = useBuilderStore()
  const { user } = useAuthStore()
  const isViewer = (user?.role || '').toUpperCase() === 'VIEWER'

  // Handle element operations - Define before useEffect hooks
  const handleAddElement = async (element: Element, parentId?: string) => {
    try {
      await addElement(element, parentId)
    } catch (error) {
      console.error('Failed to add element:', error)
    }
  }

  const handleMoveElement = async (elementId: string, newParentId: string, newOrder: number) => {
    try {
      await moveElement(elementId, newParentId, newOrder)
    } catch (error) {
      console.error('Failed to move element:', error)
    }
  }

  const handleUpdateElement = async (elementId: string, updates: Partial<Element>) => {
    try {
      await updateElement(elementId, updates)
    } catch (error) {
      console.error('Failed to update element:', error)
    }
  }

  const handleDeleteElement = async (elementId: string) => {
    try {
      await deleteElement(elementId)
      selectElement(null)
    } catch (error) {
      console.error('Failed to delete element:', error)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z for undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      
      // Ctrl+Shift+Z or Ctrl+Y for redo
      if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault()
        redo()
      }
      
      // Ctrl+C for copy
      if (e.ctrlKey && e.key === 'c' && selectedElement) {
        e.preventDefault()
        copyElement(selectedElement.id)
      }
      
      // Ctrl+V for paste
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault()
        pasteElement()
      }
      
      // Delete key
      if (e.key === 'Delete' && selectedElement) {
        e.preventDefault()
        handleDeleteElement(selectedElement.id)
      }
      
      // Escape to deselect
      if (e.key === 'Escape') {
        selectElement(null)
      }

      // Nudge selected (freeform)
      if (selectedElement && (selectedElement as any).props && typeof (selectedElement as any).props.x === 'number') {
        const step = e.shiftKey ? 10 : 1
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
          e.preventDefault()
          const { x = 0, y = 0 } = (selectedElement as any).props
          const nx = e.key === 'ArrowLeft' ? x - step : e.key === 'ArrowRight' ? x + step : x
          const ny = e.key === 'ArrowUp' ? y - step : e.key === 'ArrowDown' ? y + step : y
          updateElement(selectedElement.id, { props: { x: nx, y: ny } as any })
        }
        // Rotate shortcuts: Q/E step 1deg, Shift+Q/E step 15deg
        if (['q','e','Q','E'].includes(e.key)) {
          e.preventDefault()
          const delta = (e.key.toLowerCase() === 'q' ? -1 : 1) * (e.shiftKey ? 15 : 1)
          const angle = ((selectedElement as any).props?.rotate || 0) + delta
          updateElement(selectedElement.id, { props: { rotate: angle } as any })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElement, undo, redo, copyElement, pasteElement, handleDeleteElement, selectElement])

  // Load website when websiteId changes
  useEffect(() => {
    const loadWebsite = async () => {
      if (websiteId) {
        const website = websites.find(w => w.id === websiteId)
        if (website) {
          setCurrentWebsite(website)
          await loadThemeTokens(website.id)
          await loadComponents(website.id)
          await loadCMSData(website.id) // Phase 3: Load CMS data
        } else if (websites.length === 0) {
          await fetchWebsites()
        }
      }
    }
    loadWebsite()
  }, [websiteId, websites, setCurrentWebsite, fetchWebsites])
  
  useEffect(() => {
    const loadPages = async () => {
      if (currentWebsite && (!currentPage || currentPage.websiteId !== currentWebsite.id)) {
        try {
          await fetchPages(currentWebsite.id)
          // If no pages exist, create a default page
          const { pages } = useBuilderStore.getState()
          if (pages.length === 0) {
            try {
              await createPage({
                name: 'Home Page',
                slug: 'home',
                title: 'Home Page',
                isHomePage: true
              })
            } catch (pageError) {
              console.error('Failed to create default page:', pageError)
              // Don't block UI - user can create page manually
            }
          }
        } catch (error) {
          console.error('Failed to fetch pages:', error)
          // Show error toast but don't crash
          toast.error('Failed to load pages. Please refresh.')
        }
      }
    }
    loadPages()
  }, [currentWebsite, currentPage, fetchPages, createPage])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentWebsite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Website not found
          </h2>
          <p className="text-muted-foreground">
            The website you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    )
  }

  return (
    <DragDropProvider
      onAddElement={handleAddElement}
      onMoveElement={handleMoveElement}
      onUpdateElement={handleUpdateElement}
      onDeleteElement={handleDeleteElement}
    >
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-100 via-white to-gray-50 overflow-hidden">
        {/* Header */}
        <BuilderHeader
          website={currentWebsite}
          currentPage={currentPage}
          responsiveMode={responsiveMode}
          onResponsiveModeChange={setResponsiveMode}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onToggleProperties={() => setIsPropertiesOpen(!isPropertiesOpen)}
          locale={currentLocale}
          onLocaleChange={async (loc) => {
            setLocale(loc)
            if (currentWebsite) {
              await fetchPages(currentWebsite.id)
            }
          }}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Sidebar */}
          {isSidebarOpen && (
            <div className="slide-in-left z-10 shadow-2xl">
              <BuilderSidebar
                website={currentWebsite}
                currentPage={currentPage}
                onPageSelect={setCurrentPage}
                onPageCreate={async (pageData) => {
                  const newPage = await createPage(pageData)
                  setCurrentPage(newPage)
                }}
              />
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col bg-gray-50 relative">
            {/* Toolbar */}
            <BuilderToolbar
              selectedElement={selectedElement}
              onUndo={() => undo()}
              onRedo={() => redo()}
              onSave={async () => {
                if (!currentPage) { toast.error('No page to save'); return }
                await saveLayout()
                toast.success('✅ Draft saved!')
              }}
              onSnapshot={async () => {
                try {
                  if (!currentWebsite) { toast.error('No website'); return }
                  toast.loading('Creating snapshot...', { id: 'snapshot' })
                  await saveLayout()
                  const { token } = useAuthStore.getState()
                  const res = await fetch(API_CONFIG.ENDPOINTS.SNAPSHOTS.CREATE(currentWebsite.id), {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                  })
                  if (!res.ok) {
                    const t = await res.text()
                    throw new Error(t || 'Snapshot failed')
                  }
                  const data = await res.json()
                  toast.success(`📦 Snapshot saved (${data?.pageCount || 0} pages)`, { id: 'snapshot' })
                } catch (e: any) {
                  toast.error(e?.message || 'Snapshot failed', { id: 'snapshot' })
                }
              }}
              onPreview={() => {
                if (!currentWebsite) return
                window.open(`https://${currentWebsite.subdomain}.ain90.online`, '_blank')
              }}
              onPublish={isViewer ? undefined : async () => {
                try {
                  if (!currentWebsite) { toast.error('No website'); return }
                  toast.loading('Publishing...', { id: 'publish' })
                  // Save draft first
                  await saveLayout()
                  const { token } = useAuthStore.getState()
                  const res = await fetch(API_CONFIG.ENDPOINTS.PUBLISH.WEBSITE(currentWebsite.id), {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                  })
                  if (!res.ok) {
                    const t = await res.text()
                    throw new Error(t || 'Publish failed')
                  }
                  const data = await res.json()
                  toast.success(`✅ Published ${data?.pages?.length || 0} page(s)`, { id: 'publish' })
                } catch (e: any) {
                  toast.error(e?.message || 'Publish failed', { id: 'publish' })
                }
              }}
              // Zoom + toggles
              zoom={zoom}
              onZoomIn={() => setZoom((z) => Math.min(3, parseFloat((z + 0.1).toFixed(2))))}
              onZoomOut={() => setZoom((z) => Math.max(0.3, parseFloat((z - 0.1).toFixed(2))))}
              onZoomReset={() => setZoom(1)}
              onFitToScreen={() => setZoom(1)}
              gridOn={showGrid}
              onToggleGrid={() => setShowGrid((v) => !v)}
              rulersOn={showRulers}
              onToggleRulers={() => setShowRulers((v) => !v)}
              onShowSnapshots={isViewer ? undefined : () => setIsSnapshotsOpen(true)}
              onShowA11y={() => setIsA11yOpen(true)}
              onShowComments={() => setIsCommentsOpen(true)}
            />

            {/* Canvas with Grid Background and Zoom */}
            <div
              ref={containerRef}
              className={`flex-1 relative overflow-auto ${isPanning ? 'cursor-grabbing' : (isSpacePressed ? 'cursor-grab' : '')}`}
              onMouseDown={(e) => {
                if (!isSpacePressed) return
                const target = containerRef.current
                if (!target) return
                setIsPanning(true)
                panStart.current = {
                  x: e.clientX,
                  y: e.clientY,
                  left: target.scrollLeft,
                  top: target.scrollTop,
                }
              }}
              onMouseMove={(e) => {
                if (!isPanning || !panStart.current || !containerRef.current) return
                e.preventDefault()
                const dx = e.clientX - panStart.current.x
                const dy = e.clientY - panStart.current.y
                containerRef.current.scrollLeft = panStart.current.left - dx
                containerRef.current.scrollTop = panStart.current.top - dy
              }}
              onMouseUp={() => { setIsPanning(false); panStart.current = null }}
              onMouseLeave={() => { setIsPanning(false); panStart.current = null }}
              onKeyDown={(e) => { if (e.code === 'Space') setIsSpacePressed(true) }}
              onKeyUp={(e) => { if (e.code === 'Space') setIsSpacePressed(false) }}
              tabIndex={0}
            >
              {showGrid && (
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />
              )}
              {showRulers && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-6 bg-white/80 border-b border-gray-200 z-10 text-[10px] text-gray-400 flex items-end">
                    {Array.from({ length: 200 }).map((_, i) => (
                      <div key={i} style={{ width: 20 }} className="h-full border-r border-gray-200 flex items-end justify-end pr-0.5">
                        {i % 5 === 0 ? i * 20 : ''}
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-0 bottom-0 left-0 w-6 bg-white/80 border-r border-gray-200 z-10 text-[10px] text-gray-400 flex flex-col items-end">
                    {Array.from({ length: 200 }).map((_, i) => (
                      <div key={i} style={{ height: 20 }} className="w-full border-b border-gray-200 flex items-start justify-end pr-0.5">
                        {i % 5 === 0 ? i * 20 : ''}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: '0 0' }}>
              <BuilderCanvas
                page={currentPage}
                selectedElement={selectedElement}
                responsiveMode={responsiveMode}
                onElementSelect={selectElement}
                freeformMode={true}
                zoom={zoom}
                websiteId={currentWebsite.id}
              />
              </div>
            </div>
          </div>

          {/* Right Side Panels */}
          <div className="flex slide-in-right z-10 shadow-2xl">
            {/* Layers Panel Toggle */}
            {isLayersOpen && (
              <BuilderLayersPanel
                elements={currentPage?.elements || []}
                selectedElement={selectedElement}
                onElementSelect={selectElement}
                onDuplicate={duplicateElement}
                onDelete={deleteElement}
              />
            )}
            
            {/* Properties Panel */}
            {isPropertiesOpen && (
              <BuilderProperties
                selectedElement={selectedElement}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
                onCopy={() => {
                  if (selectedElement) copyElement(selectedElement.id)
                }}
                onDuplicate={() => {
                  if (selectedElement) duplicateElement(selectedElement.id)
                }}
                onPaste={pasteElement}
              />
            )}
          </div>
        </div>

        {/* Responsive Indicator */}
        <ResponsiveIndicator mode={responsiveMode} />

        {/* Component Editor Modal */}
        {editingComponentId && (
          <ComponentEditorModal
            componentId={editingComponentId}
            onClose={() => editComponent(null)}
          />
        )}

        {/* Global Modal */}
        <GlobalModal />

        {/* Versions Modal */}
        {currentWebsite && (
          <SnapshotsModal
            websiteId={currentWebsite.id}
            isOpen={isSnapshotsOpen}
            onClose={() => setIsSnapshotsOpen(false)}
          />
        )}

        {/* Accessibility Report */}
        <AccessibilityReportModal
          page={currentPage}
          isOpen={isA11yOpen}
          onClose={() => setIsA11yOpen(false)}
        />

        {/* Comments */}
        <CommentsModal
          page={currentPage}
          selectedElement={selectedElement}
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
        />
      </div>
    </DragDropProvider>
  )
}

export default BuilderLayout
