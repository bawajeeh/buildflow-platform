import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DragDropProvider } from '@/components/drag-drop/DragDropProvider'
import { useBuilderStore } from '@/store'
import { useWebsiteStore } from '@/store'
import toast from 'react-hot-toast'

// Layout Components
import BuilderHeader from './BuilderHeader'
import BuilderSidebar from './BuilderSidebar'
import BuilderCanvas from '../builder/BuilderCanvas'
import BuilderProperties from './BuilderProperties'
import BuilderToolbar from './BuilderToolbar'
import BuilderLayersPanel from './BuilderLayersPanel'

// UI Components
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ResponsiveIndicator from '@/components/ui/ResponsiveIndicator'

// Types
import { Element } from '@/types'

const BuilderLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { websiteId } = useParams<{ websiteId: string }>()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true)
  const [isLayersOpen, setIsLayersOpen] = useState(false)
  const [responsiveMode, setResponsiveMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

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
    redo
  } = useBuilderStore()

  const { currentWebsite, websites, setCurrentWebsite, fetchWebsites } = useWebsiteStore()

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
            await createPage({
              name: 'Home Page',
              slug: 'home',
              title: 'Home Page',
              isHomePage: true
            })
          }
        } catch (error) {
          console.error('Failed to fetch pages:', error)
        }
      }
    }
    loadPages()
  }, [currentWebsite, currentPage, fetchPages, createPage])

  // Handle element operations
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
                if (!currentPage) {
                  toast.error('No page to save')
                  return
                }
                try {
                  await updateElement('current-page', {})
                  toast.success('✅ Draft saved!')
                } catch (error) {
                  toast.error('Failed to save')
                }
              }}
              onPreview={() => {
                if (!currentWebsite) return
                window.open(`https://${currentWebsite.subdomain}.ain90.online`, '_blank')
              }}
              onPublish={async () => {
                toast.success('🚀 Publishing...')
              }}
            />

            {/* Canvas with Grid Background */}
            <div className="flex-1 relative overflow-auto" style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0,0,0,0.02) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.02) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}>
              <BuilderCanvas
                page={currentPage}
                selectedElement={selectedElement}
                responsiveMode={responsiveMode}
                onElementSelect={selectElement}
              />
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
      </div>
    </DragDropProvider>
  )
}

export default BuilderLayout
