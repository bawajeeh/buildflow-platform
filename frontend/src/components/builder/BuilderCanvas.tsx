import React, { useCallback, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Page, Element } from '@/types'
import realTimeService from '@/services/realTimeService'
import { useBuilderStore } from '@/store'
import toast from 'react-hot-toast'

// Components
import ElementRenderer from './ElementRenderer'
import DropZone from './DropZone'
import EmptyState from './EmptyState'

// Types
interface BuilderCanvasProps {
  page: Page | null
  selectedElement: Element | null
  responsiveMode: 'desktop' | 'tablet' | 'mobile'
  onElementSelect: (element: Element | null) => void
  freeformMode?: boolean
  zoom?: number
  websiteId?: string
}

const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  page,
  selectedElement,
  responsiveMode,
  onElementSelect,
  freeformMode = false,
  zoom = 1,
  websiteId,
}) => {
  const { hoveredElement, hoverElement } = useBuilderStore()
  
  // Store functions in refs to prevent infinite loops - CRITICAL: Don't destructure addElement/updateElement!
  const addElementRef = React.useRef(useBuilderStore.getState().addElement)
  const updateElementRef = React.useRef(useBuilderStore.getState().updateElement)
  
  // Update refs on every render - this MUST run on every render to keep refs current
  // Using layoutEffect ensures refs are updated before paint
  React.useLayoutEffect(() => {
    addElementRef.current = useBuilderStore.getState().addElement
    updateElementRef.current = useBuilderStore.getState().updateElement
  }) // No dependencies - intentionally runs every render
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const dragStart = React.useRef<{ x: number; y: number; ex: number; ey: number } | null>(null)
  const [resizingId, setResizingId] = React.useState<string | null>(null)
  const resizeStart = React.useRef<{ x: number; y: number; ex: number; ey: number; ew: number; eh: number; dir: string } | null>(null)
  const [rotatingId, setRotatingId] = React.useState<string | null>(null)
  const rotateStart = React.useRef<{ cx: number; cy: number; startAngle: number; baseAngle: number } | null>(null)
  const [guides, setGuides] = React.useState<{ v?: number; h?: number } | null>(null)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [marquee, setMarquee] = React.useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const groupStart = React.useRef<Record<string, { x: number; y: number }>>({})
  const [remoteCursors, setRemoteCursors] = React.useState<Record<string, { x: number; y: number; t: number }>>({})
  const [remoteLocks, setRemoteLocks] = React.useState<Record<string, string>>({})

  // Helpers for selection bounds
  const selectionBounds = React.useMemo(() => {
    if (!page?.elements || selectedIds.size === 0) return null
    const selected = page.elements.filter(el => selectedIds.has(el.id))
    if (selected.length === 0) return null
    const xs = selected.map(el => el.props?.x ?? 0)
    const ys = selected.map(el => el.props?.y ?? 0)
    const xe = selected.map(el => (el.props?.x ?? 0) + (el.props?.width ?? 200))
    const ye = selected.map(el => (el.props?.y ?? 0) + (el.props?.height ?? 60))
    const minX = Math.min(...xs), minY = Math.min(...ys)
    const maxX = Math.max(...xe), maxY = Math.max(...ye)
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
  }, [page?.elements, selectedIds])

  const alignSelected = (mode: 'left'|'center'|'right'|'top'|'middle'|'bottom') => {
    if (!page?.elements || !selectionBounds) return
    const ids = Array.from(selectedIds)
    for (const id of ids) {
      const el = page.elements.find(e => e.id === id)
      if (!el) continue
      const w = el.props?.width ?? 200
      const h = el.props?.height ?? 60
      let x = el.props?.x ?? 0
      let y = el.props?.y ?? 0
      if (mode === 'left') x = selectionBounds.x
      if (mode === 'center') x = selectionBounds.x + (selectionBounds.w - w) / 2
      if (mode === 'right') x = selectionBounds.x + selectionBounds.w - w
      if (mode === 'top') y = selectionBounds.y
      if (mode === 'middle') y = selectionBounds.y + (selectionBounds.h - h) / 2
      if (mode === 'bottom') y = selectionBounds.y + selectionBounds.h - h
      updateElementRef.current(id, { props: { x: Math.round(x), y: Math.round(y) } as any })
    }
  }

  const distributeSelected = (axis: 'h'|'v') => {
    if (!page?.elements || selectedIds.size < 3 || !selectionBounds) return
    const selected = page.elements.filter(el => selectedIds.has(el.id))
    const sorted = [...selected].sort((a, b) => (axis === 'h' ? (a.props?.x ?? 0) - (b.props?.x ?? 0) : (a.props?.y ?? 0) - (b.props?.y ?? 0)))
    if (axis === 'h') {
      const totalWidth = sorted.reduce((acc, el) => acc + (el.props?.width ?? 200), 0)
      const gaps = (selectionBounds.w - totalWidth) / (sorted.length - 1)
      let cursor = selectionBounds.x
      for (const el of sorted) {
        updateElementRef.current(el.id, { props: { x: Math.round(cursor), y: el.props?.y ?? 0 } as any })
        cursor += (el.props?.width ?? 200) + gaps
      }
    } else {
      const totalHeight = sorted.reduce((acc, el) => acc + (el.props?.height ?? 60), 0)
      const gaps = (selectionBounds.h - totalHeight) / (sorted.length - 1)
      let cursor = selectionBounds.y
      for (const el of sorted) {
        updateElementRef.current(el.id, { props: { y: Math.round(cursor), x: el.props?.x ?? 0 } as any })
        cursor += (el.props?.height ?? 60) + gaps
      }
    }
  }

  const groupSelected = () => {
    if (!page?.elements || selectedIds.size < 2) return
    const gid = `group-${Date.now()}`
    for (const id of selectedIds) {
      updateElementRef.current(id, { props: { groupId: gid } as any })
    }
  }

  const ungroupSelected = () => {
    if (!page?.elements || selectedIds.size === 0) return
    for (const id of selectedIds) {
      updateElementRef.current(id, { props: { groupId: undefined } as any })
    }
  }

  // Make the page root droppable
  const { setNodeRef: setPageRef, isOver: isPageOver } = useDroppable({
    id: 'page-root',
  })

  // Get page elements sorted by order
  const sortedElements = useMemo(() => {
    if (!page?.elements || !Array.isArray(page.elements)) return []
    return [...page.elements].sort((a, b) => (a.order || 0) - (b.order || 0))
  }, [page?.elements])

  // Handle element click
  const handleElementClick = useCallback((element: Element, event: React.MouseEvent) => {
    event.stopPropagation()
    onElementSelect(element)
  }, [onElementSelect])

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onElementSelect(null)
      setSelectedIds(new Set())
    }
  }, [onElementSelect])

  // Handle element hover
  const handleElementHover = useCallback((element: Element | null) => {
    hoverElement(element)
  }, [hoverElement])

  // Render element with drag & drop support
  const renderElement = useCallback((element: Element) => {
    const inner = (
      <ElementRenderer
        key={element.id}
        element={element}
        isSelected={selectedElement?.id === element.id}
        isHovered={hoveredElement?.id === element.id}
        responsiveMode={responsiveMode}
        onClick={(e) => handleElementClick(element, e)}
        onHover={handleElementHover}
      />
    )

    if (!freeformModeRef.current) return inner

    const x = element.props?.x ?? 40
    const y = element.props?.y ?? 40
    const w = element.props?.width
    const h = element.props?.height

    const onMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (remoteLocks[element.id]) {
        toast.error('Element is locked by another user')
        return
      }
      // Multi-select toggle with Shift
      if (e.shiftKey) {
        setSelectedIds((prev) => {
          const next = new Set(prev)
          if (next.has(element.id)) next.delete(element.id); else next.add(element.id)
          return next
        })
      } else {
        setSelectedIds(new Set([element.id]))
      }
      setDraggingId(element.id)
      dragStart.current = { x: e.clientX, y: e.clientY, ex: x, ey: y }
      // capture starting positions for group drag
      groupStart.current = {}
      const ids = new Set(selectedIds.size ? selectedIds : new Set([element.id]))
      for (const el of (page?.elements || [])) {
        if (ids.has(el.id)) {
          groupStart.current[el.id] = { x: el.props?.x ?? 0, y: el.props?.y ?? 0 }
        }
      }
      onElementSelect(element)
    }

    const style: React.CSSProperties = {
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      cursor: draggingIdRef.current === element.id ? 'grabbing' : 'grab',
      transform: `rotate(${element.props?.rotate || 0}deg)`,
      transformOrigin: 'center',
    }

    return (
      <div key={element.id} style={style} onMouseDown={onMouseDown}>
        {inner}
        {(selectedElement?.id === element.id || selectedIds.has(element.id)) && (
          <>
            <div className="absolute inset-0 ring-1 ring-blue-500 pointer-events-none" />
            {/* Rotation handle */}
            <div
              className="absolute -top-6 left-1/2 -ml-2 w-4 h-4 bg-white border border-blue-500 rounded-full cursor-alias"
              onMouseDown={(e) => {
                e.stopPropagation()
                setRotatingId(element.id)
                const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
                const cx = rect.left + rect.width / 2
                const cy = rect.top + rect.height / 2
                rotateStart.current = {
                  cx,
                  cy,
                  startAngle: Math.atan2(e.clientY - cy, e.clientX - cx),
                  baseAngle: (element.props?.rotate || 0) * (Math.PI / 180),
                }
              }}
              title="Rotate"
            />
            {['nw','n','ne','e','se','s','sw','w'].map((dir) => {
              const base = 'absolute w-2 h-2 bg-white border border-blue-500 rounded-sm'
              const pos: Record<string, string> = {
                nw: 'top-0 left-0 -mt-1 -ml-1 cursor-nwse-resize',
                n: 'top-0 left-1/2 -mt-1 -ml-1 cursor-ns-resize',
                ne: 'top-0 right-0 -mt-1 -mr-1 cursor-nesw-resize',
                e: 'top-1/2 right-0 -mr-1 -mt-1 cursor-ew-resize',
                se: 'bottom-0 right-0 -mb-1 -mr-1 cursor-nwse-resize',
                s: 'bottom-0 left-1/2 -mb-1 -ml-1 cursor-ns-resize',
                sw: 'bottom-0 left-0 -mb-1 -ml-1 cursor-nesw-resize',
                w: 'top-1/2 left-0 -ml-1 -mt-1 cursor-ew-resize',
              }
              return (
                <div
                  key={dir}
                  className={`${base} ${pos[dir]}`}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    setResizingId(element.id)
                    resizeStart.current = { x: e.clientX, y: e.clientY, ex: x, ey: y, ew: w || 200, eh: h || 60, dir }
                  }}
                />
              )
            })}
          </>
        )}
      </div>
    )
  }, [selectedElement, hoveredElement, responsiveMode, handleElementClick, handleElementHover, freeformMode, onElementSelect]) // Removed draggingId - causes infinite loop

  // Handle drop event
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const data = e.dataTransfer.getData('application/json')
    const assetUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain')
    if (assetUrl && freeformModeRef.current) {
      try {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const dropX = (e.clientX - rect.left) / (zoomRef.current || 1)
        const dropY = (e.clientY - rect.top) / (zoomRef.current || 1)
        const newElement: Element = {
          id: `element-${Date.now()}`,
          type: 'IMAGE' as any,
          name: 'Image',
          props: { x: Math.max(0, Math.round(dropX)), y: Math.max(0, Math.round(dropY)), width: 240, src: assetUrl },
          styles: {},
          order: sortedElements.length,
          isVisible: true,
          responsive: {},
          pageId: page?.id,
          parentId: undefined,
        }
        await addElementRef.current(newElement)
        toast.success('🖼️ Image added')
        return
      } catch (error) {
        console.error('Failed to drop asset:', error)
      }
    }
    if (data) {
      try {
        const elementData = JSON.parse(data)
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const dropX = (e.clientX - rect.left) / (zoomRef.current || 1)
        const dropY = (e.clientY - rect.top) / (zoomRef.current || 1)
        const newElement: Element = {
          id: `element-${Date.now()}`,
          type: elementData.type.toUpperCase() as any,
          name: elementData.name,
          props: freeformModeRef.current ? { x: Math.max(0, Math.round(dropX)), y: Math.max(0, Math.round(dropY)), width: 240 } : {},
          styles: {},
          order: sortedElements.length,
          isVisible: true,
          responsive: {},
          pageId: page?.id,
          parentId: undefined,
        }
        
        // Show success message with emoji
        await addElementRef.current(newElement)
        toast.success(`✅ ${elementData.name} added successfully!`, {
          duration: 2000,
          style: {
            background: '#10B981',
            color: '#fff',
          },
        })
      } catch (error) {
        console.error('Failed to add element:', error)
        toast.error('❌ Failed to add element', {
          duration: 3000,
        })
      }
    }
  }, [sortedElements.length, page?.id]) // Removed freeformMode and zoom - use refs instead

  // Render empty state if no elements
  if (!page || sortedElements.length === 0) {
    return (
      <div
        ref={setPageRef}
        className={`min-h-full p-8 transition-all duration-300 ${
          isPageOver 
            ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed border-blue-400 shadow-lg' 
            : 'bg-gradient-to-br from-gray-50 to-white'
        }`}
        onClick={handleCanvasClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {isPageOver ? (
          <div className="text-center py-16 animate-pulse">
            <div className="text-6xl mb-4 transform scale-110 transition-transform">✨</div>
            <p className="text-blue-600 font-semibold text-lg">Drop your element here!</p>
            <p className="text-blue-400 text-sm mt-1">Release to add to page</p>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    )
  }

  React.useEffect(() => {
    const onRemoteCursor = (e: any) => {
      const d = e.detail
      setRemoteCursors((prev) => ({ ...prev, [d.userId]: { x: d.x, y: d.y, t: Date.now() } }))
    }
    const onLocked = (e: any) => {
      const d = e.detail as { elementId: string; userId: string }
      setRemoteLocks((prev) => ({ ...prev, [d.elementId]: d.userId }))
    }
    const onUnlocked = (e: any) => {
      const d = e.detail as { elementId: string; userId: string }
      setRemoteLocks((prev) => {
        const next = { ...prev }
        delete next[d.elementId]
        return next
      })
    }
    window.addEventListener('realtime:cursor:moved', onRemoteCursor as any)
    window.addEventListener('realtime:element:locked', onLocked as any)
    window.addEventListener('realtime:element:unlocked', onUnlocked as any)
    const cleanup = setInterval(() => {
      setRemoteCursors((prev) => {
        const now = Date.now()
        const next: typeof prev = {}
        for (const [k, v] of Object.entries(prev)) {
          if (now - v.t < 5000) next[k] = v
        }
        return next
      })
    }, 2000)
    return () => {
      window.removeEventListener('realtime:cursor:moved', onRemoteCursor as any)
      window.removeEventListener('realtime:element:locked', onLocked as any)
      window.removeEventListener('realtime:element:unlocked', onUnlocked as any)
      clearInterval(cleanup)
    }
  }, [])

  React.useEffect(() => {
    if (!websiteId) return
    realTimeService.joinWebsite(websiteId)
    return () => { realTimeService.leaveWebsite(websiteId) }
  }, [websiteId])

  // Emit local cursor position periodically
  const lastEmitRef = React.useRef<number>(0)
  const marqueeRef = React.useRef(marquee)
  const pageRef = React.useRef(page)
  const selectedIdsRef = React.useRef(selectedIds)
  const draggingIdRef = React.useRef(draggingId)
  const resizingIdRef = React.useRef(resizingId)
  const rotatingIdRef = React.useRef(rotatingId)
  const zoomRef = React.useRef(zoom)
  const freeformModeRef = React.useRef(freeformMode)
  
  // Update all refs on every render to keep them current
  // This MUST run on every render - using layoutEffect to update before paint
  React.useLayoutEffect(() => {
    marqueeRef.current = marquee
    pageRef.current = page
    selectedIdsRef.current = selectedIds
    draggingIdRef.current = draggingId
    resizingIdRef.current = resizingId
    rotatingIdRef.current = rotatingId
    zoomRef.current = zoom
    freeformModeRef.current = freeformMode
    // Update refs for store functions
    addElementRef.current = useBuilderStore.getState().addElement
    updateElementRef.current = useBuilderStore.getState().updateElement
  }) // Intentionally NO dependencies - runs on every render to keep refs current

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (marqueeRef.current) {
        // update marquee size
        setMarquee((m) => (m ? { ...m, w: e.clientX - m.x, h: e.clientY - m.y } : m))
        return
      }
      if (draggingIdRef.current && dragStart.current) {
        const dx = (e.clientX - dragStart.current.x) / (zoomRef.current || 1)
        const dy = (e.clientY - dragStart.current.y) / (zoomRef.current || 1)
        let nx = dragStart.current.ex + dx
        let ny = dragStart.current.ey + dy
        // Smart guides vs other elements
        const threshold = 6
        const me = (pageRef.current?.elements || []).find(el => el.id === draggingIdRef.current)
        const meW = (me?.props?.width || 200)
        const meH = (me?.props?.height || 60)
        const meCenterX = nx + meW / 2
        const meCenterY = ny + meH / 2
        let vGuide: number | undefined
        let hGuide: number | undefined
        for (const el of (pageRef.current?.elements || [])) {
          if (!el || el.id === draggingIdRef.current) continue
          const ex = el.props?.x ?? 0
          const ey = el.props?.y ?? 0
          const ew = el.props?.width ?? 200
          const eh = el.props?.height ?? 60
          const cX = ex + ew / 2
          const cY = ey + eh / 2
          const edgesX = [ex, cX, ex + ew]
          const edgesY = [ey, cY, ey + eh]
          // Vertical snap (align X or centers)
          for (const xVal of edgesX) {
            if (Math.abs(meCenterX - xVal) <= threshold) { nx = xVal - meW / 2; vGuide = xVal; }
            if (Math.abs(nx - xVal) <= threshold) { nx = xVal; vGuide = xVal; }
            if (Math.abs(nx + meW - xVal) <= threshold) { nx = xVal - meW; vGuide = xVal; }
          }
          // Horizontal snap (align Y or centers)
          for (const yVal of edgesY) {
            if (Math.abs(meCenterY - yVal) <= threshold) { ny = yVal - meH / 2; hGuide = yVal; }
            if (Math.abs(ny - yVal) <= threshold) { ny = yVal; hGuide = yVal; }
            if (Math.abs(ny + meH - yVal) <= threshold) { ny = yVal - meH; hGuide = yVal; }
          }
        }
        setGuides({ v: vGuide, h: hGuide })
        const snapGrid = (v: number) => Math.round(v / 10) * 10
        // Group drag: move all selected
        const ids = new Set(selectedIdsRef.current.size ? selectedIdsRef.current : new Set([draggingIdRef.current]))
        if (ids.size > 1) {
          for (const id of ids) {
            const start = groupStart.current[id]
            if (!start) continue
            const gx = snapGrid(start.x + (nx - (dragStart.current.ex)))
            const gy = snapGrid(start.y + (ny - (dragStart.current.ey)))
            updateElementRef.current(id, { props: { x: gx, y: gy } as any })
          }
        } else {
          updateElementRef.current(draggingIdRef.current, { props: { x: snapGrid(nx), y: snapGrid(ny) } as any })
        }
        return
      }
      if (resizingIdRef.current && resizeStart.current) {
        const dx = (e.clientX - resizeStart.current.x) / (zoomRef.current || 1)
        const dy = (e.clientY - resizeStart.current.y) / (zoomRef.current || 1)
        let { ex, ey, ew, eh, dir } = resizeStart.current
        let nx = ex, ny = ey, nw = ew, nh = eh
        if (dir.includes('e')) nw = ew + dx
        if (dir.includes('s')) nh = eh + dy
        if (dir.includes('w')) { nw = ew - dx; nx = ex + dx }
        if (dir.includes('n')) { nh = eh - dy; ny = ey + dy }
        const snap = (v: number) => Math.max(10, Math.round(v / 10) * 10)
        setGuides(null)
        updateElementRef.current(resizingIdRef.current, { props: { x: snap(nx), y: snap(ny), width: snap(nw), height: snap(nh) } as any })
        return
      }
      if (rotatingIdRef.current && rotateStart.current) {
        const a = Math.atan2(e.clientY - rotateStart.current.cy, e.clientX - rotateStart.current.cx)
        const angle = (rotateStart.current.baseAngle + (a - rotateStart.current.startAngle)) * (180 / Math.PI)
        const snapped = Math.round(angle / 15) * 15
        updateElementRef.current(rotatingIdRef.current, { props: { rotate: snapped } as any })
      }
    }
    const onUp = () => {
      if (marqueeRef.current) {
        const rect = {
          x1: Math.min(marqueeRef.current.x, marqueeRef.current.x + marqueeRef.current.w),
          y1: Math.min(marqueeRef.current.y, marqueeRef.current.y + marqueeRef.current.h),
          x2: Math.max(marqueeRef.current.x, marqueeRef.current.x + marqueeRef.current.w),
          y2: Math.max(marqueeRef.current.y, marqueeRef.current.y + marqueeRef.current.h),
        }
        const next = new Set<string>()
        for (const el of (pageRef.current?.elements || [])) {
          const ex = el.props?.x ?? 0
          const ey = el.props?.y ?? 0
          const ew = el.props?.width ?? 200
          const eh = el.props?.height ?? 60
          const gx1 = ex
          const gy1 = ey
          const gx2 = ex + ew
          const gy2 = ey + eh
          if (gx1 >= rect.x1 && gy1 >= rect.y1 && gx2 <= rect.x2 && gy2 <= rect.y2) {
            next.add(el.id)
          }
        }
        setSelectedIds(next)
        setMarquee(null)
      }
      setDraggingId(null)
      dragStart.current = null
      setResizingId(null)
      resizeStart.current = null
      setRotatingId(null)
      rotateStart.current = null
      setGuides(null)
    }
    if (freeformModeRef.current) {
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [freeformMode]) // Only depend on freeformMode - use refs for everything else

  return (
    <div
      ref={setPageRef}
      className={`min-h-full bg-white transition-all duration-300 relative ${
        isPageOver ? 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-4 border-dashed border-blue-400 shadow-2xl transform scale-[1.02]' : 'bg-white'
      }`}
      style={{
        backgroundImage: isPageOver 
          ? `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.15) 1px, transparent 0)`
          : 'none',
        backgroundSize: '40px 40px'
      }}
      onClick={handleCanvasClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onMouseMove={(e) => {
        try {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
          const x = (e.clientX - rect.left) / (zoom || 1)
          const y = (e.clientY - rect.top) / (zoom || 1)
          const { setPointerPosition } = useBuilderStore.getState()
          setPointerPosition({ x, y })
          const now = performance.now()
          if (websiteId && now - (lastEmitRef.current || 0) > 100) {
            lastEmitRef.current = now
            realTimeService.updateCursor(x, y, websiteId)
          }
        } catch {}
      }}
      onMouseDown={(e) => {
        if (!freeformModeRef.current) return
        // start marquee if clicked on canvas background
        if (e.target === e.currentTarget) {
          setMarquee({ x: e.clientX, y: e.clientY, w: 0, h: 0 })
        }
      }}
    >
      <SortableContext
        items={sortedElements.map(el => el.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="relative">
          {/* Smart guides visuals */}
          {freeformModeRef.current && guides?.v !== undefined && (
            <div className="absolute top-0 bottom-0 border-r-2 border-pink-500/70 pointer-events-none" style={{ left: guides.v }} />
          )}
          {freeformModeRef.current && guides?.h !== undefined && (
            <div className="absolute left-0 right-0 border-b-2 border-pink-500/70 pointer-events-none" style={{ top: guides.h }} />
          )}
          {/* Marquee selection */}
          {freeformModeRef.current && marquee && (
            <div
              className="absolute bg-blue-500/10 border border-blue-500/60 pointer-events-none"
              style={{ left: Math.min(marquee.x, marquee.x + marquee.w), top: Math.min(marquee.y, marquee.y + marquee.h), width: Math.abs(marquee.w), height: Math.abs(marquee.h) }}
            />
          )}
          {/* Page Elements */}
          {sortedElements.map((element) => (
            <div key={element.id} className="relative group">
              {/* Element Selection Overlay */}
              {selectedElement?.id === element.id && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-primary rounded-md" />
                  <div className="absolute -top-8 left-0 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                    {element.name}
                  </div>
                </div>
              )}

              {/* Element Hover Overlay */}
              {hoveredElement?.id === element.id && selectedElement?.id !== element.id && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <div className="absolute inset-0 border border-muted-foreground/50 rounded-md" />
                </div>
              )}

              {/* Render Element */}
              {/* Lock overlay */}
              {remoteLocks[element.id] && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1 right-1 text-[10px] bg-yellow-500 text-white px-1.5 py-0.5 rounded">Locked</div>
                </div>
              )}
              {renderElement(element)}

              {/* Drop Zones for Element */}
              <DropZone
                id={`dropzone-${element.id}`}
                parentId={element.id}
                accepts={getElementAccepts(element.type)}
                className="absolute inset-0 pointer-events-none"
              />
            </div>
          ))}

          {/* Bottom Drop Zone */}
          <DropZone
            id="dropzone-page-bottom"
            parentId="page-root"
            accepts={['SECTION', 'CONTAINER', 'NAVBAR']}
            className="min-h-16 border-2 border-dashed border-muted-foreground/25 rounded-lg m-4 flex items-center justify-center text-muted-foreground text-sm"
          >
            Drop elements here
          </DropZone>
        </div>
        {/* Context toolbar for selection */}
        {freeformModeRef.current && selectionBounds && selectedIds.size >= 2 && (
          <div
            className="absolute z-20 bg-white/95 backdrop-blur border border-gray-200 rounded-md shadow-md text-xs flex items-center divide-x divide-gray-200"
            style={{ left: selectionBounds.x, top: Math.max(0, selectionBounds.y - 32) }}
          >
            <div className="flex items-center">
              <button className="px-2 py-1 hover:bg-gray-100" title="Align Left" onClick={() => alignSelected('left')}>⬅️</button>
              <button className="px-2 py-1 hover:bg-gray-100" title="Align Center" onClick={() => alignSelected('center')}>↔️</button>
              <button className="px-2 py-1 hover:bg-gray-100" title="Align Right" onClick={() => alignSelected('right')}>➡️</button>
            </div>
            <div className="flex items-center">
              <button className="px-2 py-1 hover:bg-gray-100" title="Align Top" onClick={() => alignSelected('top')}>⬆️</button>
              <button className="px-2 py-1 hover:bg-gray-100" title="Align Middle" onClick={() => alignSelected('middle')}>↕️</button>
              <button className="px-2 py-1 hover:bg-gray-100" title="Align Bottom" onClick={() => alignSelected('bottom')}>⬇️</button>
            </div>
            <div className="flex items-center">
              <button className="px-2 py-1 hover:bg-gray-100" title="Distribute Horizontally" onClick={() => distributeSelected('h')}>📐 H</button>
              <button className="px-2 py-1 hover:bg-gray-100" title="Distribute Vertically" onClick={() => distributeSelected('v')}>📐 V</button>
            </div>
            <div className="flex items-center">
              <button className="px-2 py-1 hover:bg-gray-100" title="Group" onClick={groupSelected}>🗂️ Group</button>
              <button className="px-2 py-1 hover:bg-gray-100" title="Ungroup" onClick={ungroupSelected}>📂 Ungroup</button>
            </div>
          </div>
        )}
        {/* Remote cursors */}
        {Object.entries(remoteCursors).map(([userId, c]) => (
          <div key={userId} className="absolute z-30 pointer-events-none" style={{ left: c.x, top: c.y }}>
            <div className="w-2 h-2 bg-pink-600 rounded-full shadow" />
          </div>
        ))}
      </SortableContext>
    </div>
  )
}

// Helper function to get accepted element types for a parent
const getElementAccepts = (parentType: string): string[] => {
  switch (parentType) {
    case 'SECTION':
      return ['CONTAINER', 'ROW', 'SPACER', 'DIVIDER']
    case 'CONTAINER':
      return ['ROW', 'COLUMN', 'SPACER', 'DIVIDER']
    case 'ROW':
      return ['COLUMN']
    case 'COLUMN':
      return [
        'HEADING', 'TEXT', 'IMAGE', 'VIDEO', 'BUTTON', 'ICON',
        'FORM', 'INPUT', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'RADIO',
        'PRODUCT_GRID', 'PRODUCT_CARD', 'CALENDAR', 'SERVICE_LIST',
        'BOOKING_FORM', 'BLOG_GRID', 'BLOG_POST', 'BLOG_CARD',
        'PORTFOLIO_GRID', 'PORTFOLIO_ITEM', 'MAP', 'EMBED', 'CODE'
      ]
    default:
      return []
  }
}

export default BuilderCanvas
